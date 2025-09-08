import Sidebar from "../(components)/sidebar";

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    );
}
