import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingBag } from "lucide-react"; // شلنا Globe من هنا

export default function Navbar() {
  const { totalCount, setIsDrawerOpen } = useCart();

  return (
    <header className="absolute top-6 left-6 right-6 z-20">
      <nav className="max-w-[1600px] mx-auto flex items-center justify-between px-10 py-5 bg-black rounded-full">
        <Link to="/" className="font-display text-lg font-bold tracking-wide text-white uppercase">
          FrameX
        </Link>

        <div className="flex items-center gap-6">
          
          {/* الجزء الخاص باللغة والعالم اتشال من هنا */}

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="
              relative
              flex
              items-center
              justify-center
              text-white/80
              hover:text-white
              transition-colors
            "
          >
            <ShoppingBag 
              size={18} 
              strokeWidth={1.75} 
            />

            {totalCount > 0 && (
              <span
                className="
                  absolute
                  -top-2
                  -right-2
                  bg-white
                  text-black
                  text-[10px]
                  rounded-full
                  w-4
                  h-4
                  flex
                  items-center
                  justify-center
                  font-semibold
                "
              >
                {totalCount}
              </span>
            )}
          </button>

        </div>
      </nav>
    </header>
  );
}