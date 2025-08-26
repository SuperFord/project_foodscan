import { Link } from "react-router-dom";
import UserImg from "./img/User.png";
import RestaImg from "./img/Resta.png";

function Main() {
    const menuItems = [
        { id: 1, name: "ลูกค้า", image: UserImg, path: "./User" },
        { id: 2, name: "ร้านอาหาร", image: RestaImg, path: "./Restaurant" } 
    ];

    return (
        <div className="p-10 flex flex-col items-center">
            {/* Title */}
            <div className="text-3xl font-bold text-center mb-6 mt-6 relative">
                ระบบจองโต๊ะ<br></br>พร้อมสั่งอาหารล่วงหน้า
                <div className="w-full h-0.5 bg-slate-200 mx-auto mt-4"></div>
            </div>

            {/* Menu Items (อยู่ในบรรทัดเดียวกัน) */}
            <div className="flex justify-center items-center gap-12 p-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className="bg-white border border-gray-300 rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 p-6 text-center w-36"
                    >
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover mx-auto rounded-md" />
                        <div className="mt-4 text-lg font-semibold">{item.name}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Main;