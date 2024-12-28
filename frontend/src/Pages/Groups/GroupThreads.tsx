import React from 'react';
import GroupThread from './GroupThread';

interface File {
    name: string;
    contentType: string;
    data: ArrayBuffer;
}

interface Comment {
    commentId: string;
    userId: string;
    content: string;
    upvotes: string[];
    downvotes: string[];
    userName: string;
}

interface AuthorInfo {
    _id: string;
    name: string;
    username: string;
    avatarUrl: string;
}

interface GroupThread {
    _id: string;
    title: string;
    content: string;
    authorId: string;
    groupId: string;
    authorInfo?: AuthorInfo;
    comments: Comment[];
    upvotes: string[];
    downvotes: string[];
    file?: File;
}

interface GroupThreadsProps {
    threads: GroupThread[];
}

const HomeThreads: React.FC<GroupThreadsProps> = ({ threads }) => {
    return (
        <div>
            <div className="space-y-6">
                {threads.length > 0 ? (
                    threads.map((thread) => (
                        <GroupThread key={thread._id} thread={thread} />
                    ))
                ) : (
                    <p className="text-gray-500 text-center">
                        No threads available. Be the first to create one!
                    </p>
                )}
            </div>
        </div>
    );
};

export default HomeThreads;
