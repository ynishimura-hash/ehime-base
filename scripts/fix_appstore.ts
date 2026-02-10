
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appStorePath = path.resolve(__dirname, '../src/lib/appStore.ts');
let content = fs.readFileSync(appStorePath, 'utf8');

// Find lines
const lines = content.split('\n');
let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
    // Check for both old and potentially partially updated signatures
    if (lines[i].includes('sendMessage: async (threadId, senderId, text, attachment, replyToId) => {') ||
        lines[i].includes('sendMessage: async (threadId, senderId, text, attachment, replyToId, fileToUpload) => {')) {
        startLine = i;
    }

    if (lines[i].includes('deleteMessage: async (threadId, messageId) => {')) {
        endLine = i;
        break;
    }
}

if (startLine === -1 || endLine === -1) {
    console.error('Could not find sendMessage block boundaries');
    console.log('Start search:', startLine);
    console.log('End search:', endLine);
    // Debug: print functionality names
    process.exit(1);
}

// Adjust endLine to capture blank lines before deleteMessage if desired, 
// but basically we want to replace everything from startLine up to endLine-1
// And we need to make sure we don't duplicate empty lines too much.

const prefix = lines.slice(0, startLine).join('\n');
const suffix = lines.slice(endLine).join('\n');

const newImplementation = `            sendMessage: async (threadId, senderId, text, attachment, replyToId, fileToUpload) => {
                const tempId = \`temp-\${Date.now()}\`;
                console.log('Sending message:', { threadId, senderId, text, attachment: attachment ? 'present' : 'none', file: fileToUpload ? 'present' : 'none' });

                // 1. Optimistic Update
                const previewUrl = fileToUpload ? URL.createObjectURL(fileToUpload) : attachment?.url;
                
                const optimisticAttachment = fileToUpload ? {
                    id: \`temp-att-\${Date.now()}\`,
                    type: fileToUpload.type.startsWith('image/') ? 'image' : 'file',
                    url: previewUrl || '',
                    name: fileToUpload.name,
                    size: \`\${(fileToUpload.size / 1024).toFixed(1)} KB\`
                } : attachment;

                set(state => ({
                    chats: state.chats.map(chat => {
                        if (chat.id !== threadId) return chat;
                        
                        const newMessage: any = {
                            id: tempId,
                            senderId: senderId,
                            text: text,
                            timestamp: Date.now(),
                            isRead: false,
                            isSystem: false,
                            attachment: optimisticAttachment
                        };

                        return {
                            ...chat,
                            messages: [...chat.messages, newMessage],
                            updatedAt: Date.now()
                        };
                    }).sort((a: any, b: any) => b.updatedAt - a.updatedAt)
                }));

                try {
                    const supabase = createClient();
                    
                    let attachmentUrl = attachment?.url;
                    let attachmentName = attachment?.name;
                    let attachmentType = attachment?.type;

                    // 2. Upload File if present
                    if (fileToUpload) {
                        const formData = new FormData();
                        formData.append('file', fileToUpload);
                        formData.append('chatId', threadId);

                        const uploadRes = await fetch('/api/upload/messages', {
                            method: 'POST',
                            body: formData
                        });

                        if (!uploadRes.ok) {
                            const err = await uploadRes.json();
                            throw new Error(err.error || 'Upload failed');
                        }

                        const uploadData = await uploadRes.json();
                        attachmentUrl = uploadData.url;
                        attachmentName = uploadData.name;
                        // Map MIME type to Attachment type
                        attachmentType = fileToUpload.type.startsWith('image/') ? 'image' : 'file';
                    } else {
                        // If no file upload, perform blob URL check for safety
                        if (attachmentUrl?.startsWith('blob:')) {
                            console.warn('Cannot persist blob URL without file object');
                            attachmentUrl = undefined;
                        }
                    }

                    const newMessagePayload = {
                        chat_id: threadId,
                        sender_id: senderId,
                        content: text,
                        attachment_url: attachmentUrl,
                        attachment_type: attachmentType,
                        attachment_name: attachmentName,
                        is_read: false
                    };

                    const { error } = await supabase.from('messages').insert(newMessagePayload).select().single();

                    if (error) throw error;

                    // 3. Sync
                    await get().fetchChats();

                } catch (error: any) {
                    console.error('Failed to send message:', error);
                    toast.error(\`メッセージ送信エラー: \${error.message || error.code}\`);
                    
                    // Revert Optimistic Update
                    set(state => ({
                        chats: state.chats.map(chat => 
                            chat.id === threadId 
                                ? { ...chat, messages: chat.messages.filter(m => m.id !== tempId) }
                                : chat
                        )
                    }));
                }
            },`;

fs.writeFileSync(appStorePath, prefix + '\n' + newImplementation + '\n\n' + suffix);
console.log('AppStore updated successfully');
