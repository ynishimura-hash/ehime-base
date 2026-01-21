import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src/data/courses.json');

// Helper to read data
const readData = () => {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            return [];
        }
        const fileContent = fs.readFileSync(DATA_PATH, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading e-learning data:', error);
        return [];
    }
};

// Helper to write data
const writeData = (data: any) => {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing e-learning data:', error);
    }
};

export async function GET() {
    const data = readData();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const currentData = readData();

        // Handle both single and multiple registrations
        const newItems = Array.isArray(body) ? body : [body];

        const updatedData = [...currentData];

        newItems.forEach((newItem: any) => {
            // Basic validation and formatting
            const course = {
                id: newItem.id || `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: newItem.title || '無題のコース',
                description: newItem.description || '',
                instructor: newItem.instructor || {
                    name: '講師未設定',
                    role: 'Expert',
                    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                },
                category: newItem.category || '未分類',
                level: newItem.level || '初級',
                duration: newItem.duration || '不明',
                image: newItem.image || 'https://images.unsplash.com/photo-1454165833767-02486835bcd4?auto=format&fit=crop&q=80&w=800',
                curriculums: newItem.curriculums || [
                    {
                        id: `curr_${Date.now()}`,
                        courseId: '', // Will be set after
                        title: '第1章',
                        description: '',
                        lessons: [],
                        order: 1
                    }
                ]
            };

            // Set courseId in curriculums
            course.curriculums = course.curriculums.map((c: any) => ({
                ...c,
                courseId: course.id
            }));

            updatedData.unshift(course);
        });

        writeData(updatedData);

        return NextResponse.json({ success: true, count: newItems.length });
    } catch (error) {
        console.error('Error processing registration:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const currentData = readData();

        const existingIndex = currentData.findIndex((c: any) => c.id === body.id);
        if (existingIndex === -1) {
            return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
        }

        // Update the course data
        currentData[existingIndex] = {
            ...currentData[existingIndex],
            ...body
        };

        writeData(currentData);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

        const currentData = readData();
        const updatedData = currentData.filter((c: any) => c.id !== id);

        writeData(updatedData);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
