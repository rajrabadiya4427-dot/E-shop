import React from 'react'
import { offersbox } from '../../../public/assets/assets'

const Hero = () => {
    return (
        <div className='min-h-[50vh] w-full py-2 md:py-10 lg:py-10 px-2 md:px-10 lg:px-20'>

            <div className="boxss flex gap-4 md:gap-10 overflow-x-auto snap-x snap-mandatory hide-scrollbar">

                {offersbox.map((item, indx) => (
                    <div key={indx} className="offerboxs snap-center min-w-[90%] lg:min-w-full h-[160px] sm:h-[280px] md:h-[380px] lg:h-[480px] xl:h-[700px] flex-shrink-0 border border-black/20 rounded-2xl bg-black/10">
                        <img src={item} alt="" className='w-full h-full object-cover rounded-2xl' />
                    </div>
                ))}

            </div>

        </div>
    )
}

export default Hero