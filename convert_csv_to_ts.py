import csv
import json
import os
import sys

# Paths
BASE_DIR = "/Users/yuyu24/2ndBrain/Ehime Base app"
CONTENT_CSV = os.path.join(BASE_DIR, "元データ/コンテンツ一覧.csv")
COURSE_CSV = os.path.join(BASE_DIR, "元データ/コース一覧.csv") 
CURRICULUM_CSV = os.path.join(BASE_DIR, "元データ/カリキュラム一覧.csv")

def clean_url(url):
    if not url: return None
    return url.strip()

def parse_content():
    items = []
    with open(CONTENT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader) # Skip header
        for row in reader:
            if not row or len(row) < 3: continue
            
            # ID(0), Title(1), URL(2), Category (Course Name)(3)
            c_id = row[0]
            title = row[1]
            url = row[2]
            category = row[3] if len(row) > 3 else "Uncategorized"
            created_at = row[-2] if len(row) > 2 else ""

            if not title: continue
            
            c_type = 'video' if 'youtu' in url else 'document'
            if 'quiz' in title.lower(): c_type = 'quiz'

            items.append({
                'id': c_id,
                'title': title,
                'type': c_type,
                'url': clean_url(url),
                'thumbnail': None, # Let frontend generate from URL
                'duration': '10:00',
                'category': category,
                'createdAt': created_at
            })
    return items

def parse_curriculums(all_content):
    # From コース一覧.csv (Now mapped to Curriculums/Subjects)
    items = []
    
    # Group content by category (Curriculum Title)
    content_by_cat = {}
    for c in all_content:
        cat = c['category']
        if cat not in content_by_cat: content_by_cat[cat] = []
        content_by_cat[cat].append(c)

    with open(COURSE_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if not row or len(row) < 3: continue
            
            c_id = row[0]
            title = row[1]
            desc = row[2]
            
            if not title: continue

            # Find matching lessons
            lessons = content_by_cat.get(title, [])

            items.append({
                'id': c_id,
                'title': title,
                'description': desc,
                'courseCount': len(lessons), # Actually lesson count
                'lessons': lessons 
            })
    return items

def parse_courses():
    # From カリキュラム一覧.csv (Now mapped to Courses/Tracks)
    items = []
    with open(CURRICULUM_CSV, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if not row or len(row) < 5: continue
            
            c_id = row[0]
            title = row[1]
            desc = row[4]
            category = "General"

            if not title: continue

            items.append({
                'id': c_id,
                'title': title,
                'description': desc,
                'category': category,
                'lessonCount': 0 # Placeholder as we don't know relationship yet
            })
    return items

def main():
    content = parse_content()
    curriculums = parse_curriculums(content) # Nest content
    courses = parse_courses()

    ts_output = """// This file contains mock data imported from CSV files.
// Generated via script.

import { ContentItem } from './mock_elearning_data'; // Self-reference hack or redefine? Better redefine or export properly. 
// Actually we will output everything in one file.

export interface ContentItem {
    id: string;
    title: string;
    type: 'video' | 'quiz' | 'document';
    url?: string;
    thumbnail?: string;
    duration?: string;
    category: string;
    createdAt: string;
}

export interface CurriculumDef {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    courseCount: number; // This is now effectively lesson count
    lessons: ContentItem[];
}

export interface CourseDef {
    id: string;
    title: string;
    description: string;
    category: string;
    lessonCount: number;
}

// ------------------------------------------------------------------
// 1. Content Data (FULL LIST)
// ------------------------------------------------------------------
export const ALL_CONTENT: ContentItem[] = """ + json.dumps(content, ensure_ascii=False, indent=4) + """;

// ------------------------------------------------------------------
// 2. Curriculum Data (with Nested Lessons)
// ------------------------------------------------------------------
export const ALL_CURRICULUMS: CurriculumDef[] = """ + json.dumps(curriculums, ensure_ascii=False, indent=4) + """;

// ------------------------------------------------------------------
// 3. Course Data
// ------------------------------------------------------------------
export const ALL_COURSES: CourseDef[] = """ + json.dumps(courses, ensure_ascii=False, indent=4) + """;
"""
    
    print(ts_output)

if __name__ == "__main__":
    main()
