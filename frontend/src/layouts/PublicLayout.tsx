import { ReactNode } from 'react';
import { PublicSidebar } from '../components/common/PublicSidebar';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <PublicSidebar currentPage="courses" />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}