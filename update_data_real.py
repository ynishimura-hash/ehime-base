import csv
import json
import re
import time
import urllib.request
from datetime import datetime
import os
import concurrent.futures

# Paths
CONTENT_CSV = "/Users/yuyu24/2ndBrain/Ehime Base app/元データ/コンテンツ一覧.csv"
COURSE_CSV = "/Users/yuyu24/2ndBrain/Ehime Base app/元データ/コース一覧.csv"
CURRICULUM_CSV = "/Users/yuyu24/2ndBrain/Ehime Base app/元データ/カリキュラム一覧.csv"
OUTPUT_TS = "src/data/mock_elearning_data.ts"
CACHE_FILE = "duration_cache.json"

# Load Cache
duration_cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r') as f:
            duration_cache = json.load(f)
    except:
        duration_cache = {}

def get_video_duration(url):
    if not url or ("youtube" not in url and "youtu.be" not in url):
        return "10:00" # Default/Fallback
    
    video_id_match = re.search(r'(?:v=|\/)([\w-]{11})(?:[&?]|$)', url)
    if not video_id_match:
        return "10:00"
    
    video_id = video_id_match.group(1)
    if video_id in duration_cache:
        return duration_cache[video_id]
        
    try:
        # Simple scraping
        with urllib.request.urlopen(url) as response:
            html = response.read().decode('utf-8')
            match = re.search(r'"approxDurationMs":"(\d+)"', html)
            if match:
                ms = int(match.group(1))
                seconds = ms // 1000
                m, s = divmod(seconds, 60)
                h, m = divmod(m, 60)
                if h > 0:
                    duration = f"{h}:{m:02d}:{s:02d}"
                else:
                    duration = f"{m:02d}:{s:02d}"
                
                duration_cache[video_id] = duration
                return duration
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        
    return "10:00" # Fallback

def save_cache():
    with open(CACHE_FILE, 'w') as f:
        json.dump(duration_cache, f)

# Read CSVs
def read_csv(path):
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

contents = read_csv(CONTENT_CSV)
courses = read_csv(COURSE_CSV) # Tracks
curriculums = read_csv(CURRICULUM_CSV) # Courses

# Group Contents by 'コース' (Course Name)
content_by_course = {}
urls_to_fetch = []

for c in contents:
    course_name = c.get('コース', '').strip()
    if not course_name:
        course_name = "未分類"
    
    if course_name not in content_by_course:
        content_by_course[course_name] = []
    
    url = c.get('YOUTUBE_URL', '')
    if url:
        vid_match = re.search(r'(?:v=|\/)([\w-]{11})(?:[&?]|$)', url)
        if vid_match:
            vid = vid_match.group(1)
            if vid not in duration_cache:
                urls_to_fetch.append(url)
    
    content_by_course[course_name].append(c)

print(f"Found {len(urls_to_fetch)} new videos to fetch durations for.")

def fetch_and_cache(url):
    get_video_duration(url)

if urls_to_fetch:
    # Limit max workers to avoid rate limits
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        list(executor.map(fetch_and_cache, urls_to_fetch))
    save_cache()

# Generate TS Content
ts_output = []

ts_output.append("""// This file contains mock data imported from CSV files.
// Generated via script with real durations.

export interface QuizData {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface ContentItem {
    id: string;
    title: string;
    type: 'video' | 'quiz' | 'document';
    url?: string;
    thumbnail?: string;
    duration?: string;
    category: string;
    createdAt: string;
    quiz?: QuizData;
}

export interface CurriculumDef {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    courseCount: number;
    lessons: ContentItem[];
}

export interface CourseDef {
    id: string;
    title: string;
    description: string;
    category: string;
    lessonCount: number;
}
""")

# 1. Output ALL_CONTENT
ts_output.append("export const ALL_CONTENT: ContentItem[] = [")

def escape_js(s):
    return s.replace("'", "\\'").replace("\n", " ").replace("\r", "")

for c in contents:
    url = c.get('YOUTUBE_URL', '')
    duration = get_video_duration(url)
    title = escape_js(c["コンテンツ名"])
    category = escape_js(c.get("コース", "未分類"))
    
    item_str = f"""    {{
        id: '{c["ID"]}',
        title: '{title}',
        type: 'video',
        url: '{url}',
        category: '{category}',
        duration: '{duration}',
        createdAt: '{c.get("Created", "")}'
    }},"""
    ts_output.append(item_str)

ts_output.append("];\n")

# 2. Output ALL_CURRICULUMS
ts_output.append("export const ALL_CURRICULUMS: CurriculumDef[] = [")

for curr in curriculums:
    curr_title = curr['コース名']
    children = content_by_course.get(curr_title, [])
    
    lessons_str = "[\n"
    for child in children:
        child_url = child.get('YOUTUBE_URL', '')
        child_dur = get_video_duration(child_url)
        child_title = escape_js(child["コンテンツ名"])
        child_cat = escape_js(curr_title)
        
        lessons_str += f"""            {{
                id: '{child["ID"]}',
                title: '{child_title}',
                type: 'video',
                url: '{child_url}',
                category: '{child_cat}',
                duration: '{child_dur}',
                createdAt: '{child.get("Created", "")}'
            }},\n"""
    lessons_str += "        ]"

    title_esc = escape_js(curr_title)
    desc_esc = escape_js(curr.get("コース概要", ""))
    
    ts_output.append(f"""    {{
        id: '{curr["ID"]}',
        title: '{title_esc}',
        description: '{desc_esc}',
        courseCount: {len(children)},
        lessons: {lessons_str}
    }},""")

ts_output.append("];\n")

# 3. Output ALL_COURSES
ts_output.append("export const ALL_COURSES: CourseDef[] = [")

for course in courses:
    title_esc = escape_js(course["プログラム名"])
    desc_esc = escape_js(course.get("カリキュラム説明", ""))
    
    ts_output.append(f"""    {{
        id: '{course["ID"]}',
        title: '{title_esc}',
        description: '{desc_esc}',
        category: 'General',
        lessonCount: 5 
    }},""")

ts_output.append("];\n")

with open(OUTPUT_TS, 'w', encoding='utf-8') as f:
    f.write("\n".join(ts_output))

print("Done generating mock_elearning_data.ts")
