import { useState } from "react";
import { Button } from "../ui/Button";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Mensaje enviado:", formData);
    // Aquí podrías conectar con una API o backend
  };

  return (
    <div className="max-w-2xl h-full mx-auto bg-primary-100 shadow-lg shadow-primary-300 rounded-2xl p-8 flex flex-col">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Contact Us
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between gap-4 min-h-0">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 shadow-md border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 shadow-md border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700"
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          rows="8"
          className="w-full p-3 shadow-md border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-32"
          required
        />
        <Button type="submit" variant="outline" size="default" className="mt-4">
          Send Message
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;
