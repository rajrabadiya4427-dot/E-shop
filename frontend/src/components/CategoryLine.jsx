import { NavLink } from "react-router-dom"
import { svgs } from "../../public/assets/assets"

const CategoryLine = () => {
  return (
    <div className='border-t border-black/5 mt-1'>
      <div className="all flex overflow-x-auto hide-scrollbar gap-4 sm:gap-8 md:gap-10 items-center justify-start md:justify-center py-2.5">
        <NavLink 
          to={"/"} 
          className={({ isActive }) => 
            `cate relative pb-1.5 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-105 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          <img src={svgs.bag} alt="bag" className="w-4 h-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
          <h2 className='text-[10px] md:text-xs font-semibold whitespace-nowrap mt-1'>For You</h2>
        </NavLink>

        <NavLink 
          to={"/category/Fashion"} 
          className={({ isActive }) => 
            `cate relative pb-1.5 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-105 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          <img src={svgs.fashion} alt="fashion" className="w-4 h-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
          <h2 className='text-[10px] md:text-xs font-semibold whitespace-nowrap mt-1'>Fashion</h2>
        </NavLink>

        <NavLink 
          to={"/category/Mobiles"} 
          className={({ isActive }) => 
            `cate relative pb-1.5 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-105 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          <img src={svgs.mobile} alt="mobile" className="w-4 h-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
          <h2 className='text-[10px] md:text-xs font-semibold whitespace-nowrap mt-1'>Mobiles</h2>
        </NavLink>

        <NavLink 
          to={"/category/Electronics"} 
          className={({ isActive }) => 
            `cate relative pb-1.5 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-105 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          <img src={svgs.tv} alt="tv" className="w-4 h-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
          <h2 className='text-[10px] md:text-xs font-semibold whitespace-nowrap mt-1'>Electronics</h2>
        </NavLink>

        <NavLink 
          to={"/category/Beauty"} 
          className={({ isActive }) => 
            `cate relative pb-1.5 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-105 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          <img src={svgs.beauty} alt="beauty" className="w-4 h-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
          <h2 className='text-[10px] md:text-xs font-semibold whitespace-nowrap mt-1'>Beauty</h2>
        </NavLink>

        <NavLink 
          to={"/category/Home"} 
          className={({ isActive }) => 
            `cate relative pb-1.5 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-105 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          <img src={svgs.home} alt="home" className="w-4 h-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
          <h2 className='text-[10px] md:text-xs font-semibold whitespace-nowrap mt-1'>Home</h2>
        </NavLink>

        <NavLink 
          to={"/category/Books"} 
          className={({ isActive }) => 
            `cate relative pb-1.5 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-105 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          <img src={svgs.book} alt="book" className="w-4 h-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
          <h2 className='text-[10px] md:text-xs font-semibold whitespace-nowrap mt-1'>Books</h2>
        </NavLink>

        <NavLink 
          to={"/category/Furniture"} 
          className={({ isActive }) => 
            `cate relative pb-1.5 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-105 font-bold' : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          <img src={svgs.furniture} alt="furniture" className="w-4 h-4 md:h-6 md:w-6 transition-transform duration-300 hover:scale-110" />
          <h2 className='text-[10px] md:text-xs font-semibold whitespace-nowrap mt-1'>Furniture</h2>
        </NavLink>
      </div>
    </div>
  )
}

export default CategoryLine;