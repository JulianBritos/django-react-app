import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const products = [
  {
    id: 1,
    name: "Desk and Office",
    description: "Work from home accessories",
    image:
      "https://tailwindui.com/plus/img/ecommerce-images/home-page-02-edition-01.jpg",
  },
  {
    id: 2,
    name: "Self-Improvement",
    description: "Journals and note-taking",
    image:
      "https://tailwindui.com/plus/img/ecommerce-images/home-page-02-edition-02.jpg",
  },
  {
    id: 3,
    name: "Travel",
    description: "Daily commute essentials",
    image:
      "https://tailwindui.com/plus/img/ecommerce-images/home-page-02-edition-03.jpg",
  },
  {
    id: 4,
    name: "Gadgets",
    description: "Latest tech gadgets",
    image: "https://via.placeholder.com/300", // Placeholder image
  },
  {
    id: 5,
    name: "Books",
    description: "Inspiring reads",
    image: "https://via.placeholder.com/300", // Placeholder image
  },
  {
    id: 6,
    name: "Home Decor",
    description: "Enhance your living space",
    image: "https://via.placeholder.com/300", // Placeholder image
  },
];

const FeaturedProducts = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        },
      },
    ],
  };

  return (
    <div className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32">
          <h2 className="text-2xl font-bold text-gray-100">
            Featured Products
          </h2>
          <Slider {...settings}>
            {products.map((product) => (
              <div key={product.id} className="group relative p-4">
                <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <h3 className="mt-6 text-sm text-gray-300">
                  <a href="#">
                    <span className="absolute inset-0"></span>
                    {product.name}
                  </a>
                </h3>
                <p className="text-base font-semibold text-gray-000">
                  {product.description}
                </p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
