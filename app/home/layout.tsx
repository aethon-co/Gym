import Sidebar from "../(components)/sidebar";

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50">
                <div className="h-full overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
