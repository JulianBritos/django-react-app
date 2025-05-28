import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum.",
    name: "John Doe",
    role: "Youtuber",
    rating: 4.5,
    image: "https://via.placeholder.com/100",
  },
  {
    id: 2,
    text: "Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
    name: "Jane Smith",
    role: "Blogger",
    rating: 4.8,
    image: "https://via.placeholder.com/100",
  },
  {
    id: 3,
    text: "Etiam interdum metus et ligula malesuada placerat. Curabitur feugiat est at justo varius, vel ultrices.",
    name: "Mark Johnson",
    role: "Influencer",
    rating: 4.2,
    image: "https://via.placeholder.com/100",
  },
];

const Testimonials = () => {
  return (
    <section className="py-2 px-2 w-full max-w-7xl mx-auto mt-6 p-6">
      <h2 className="text-3xl font-bold text-center mb-8">
        Lo que dicen nuestros clientes
      </h2>
      <Swiper
        className=""
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 1 }, // Móvil
          1024: { slidesPerView: 2 }, // Escritorio
        }}
      >
        {testimonials.map((testimonial) => (
          <SwiperSlide className="py-10" key={testimonial.id}>
            <div className="bg-primary-100 p-6 mx-3 rounded-lg shadow-lg shadow-primary-300 flex flex-col items-start text-left">
              <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
              <div className="flex items-center mt-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div className="grid grid-cols-3">
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                  <div className="ml-4 flex items-baseline">
                    <Star size={16} className="text-yellow-500" />
                    <span className="ml-2 font-semibold">
                      {testimonial.rating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Testimonials;
