import { ReactNode } from 'react';
import { PublicSidebar } from '../components/common/PublicSidebar';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="flex h-screen bg-gray-50">
            <PublicSidebar currentPage="courses" />
            <main className="flex-1 overflow-y-auto w-full">
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}