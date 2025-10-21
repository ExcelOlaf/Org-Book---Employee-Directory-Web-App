import { useNavigate } from "react-router-dom";

const tiles = [
    {
        name: "Department Lookup", path: "/departments"
    },
    {
        name: "Employee Lookup", path: "/employees"
    },
    {
        name: "Org Tree", path: "/org-tree"
    },
    {
        name: "Settings", path: "/settings"
    }
];

export default function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-2 gap-6">
                {
                    tiles.map((tile) => (
                        <button
                        key={tile.name}
                        onClick={() => navigate(tile.path)}
                        className="bg-white shadow-lg rounded-2xl p-8 hover:scale-105 transition"
                        >
                            {tile.name}
                        </button>
                    ))
                }
            </div>
        </div>

    );
}