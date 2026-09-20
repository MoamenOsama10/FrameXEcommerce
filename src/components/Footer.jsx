// Steps:
// 1- Replace Newsletter with Message To Admin form
// 2- Keep Instagram, TikTok and WhatsApp icons
// 3- Keep MoamenOsama developer link
// 4- Keep original footer layout and Tailwind styling
import { API_URL } from "../config";
import { useState } from "react";
import {
  FaInstagram,
  FaTiktok,
  FaWhatsapp
} from "react-icons/fa";

export default function Footer() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    }),
  });

  alert("تم إرسال رسالتك بنجاح!");

  setFormData({ name: "", email: "", message: "" });
};
  return (

    <footer className="bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Message To Admin */}

        <h3 className="
          text-xs
          font-bold
          tracking-wide
          uppercase
          mb-4
        ">
          Message To Admin
        </h3>

        <form
          onSubmit={handleSubmit}
          className="max-w-sm space-y-3"
        >

          {/* Name */}

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="
              w-full
              bg-transparent
              border
              border-white/20
              rounded-full
              px-4
              py-3
              text-sm
              placeholder:text-white/40
              focus:outline-none
              focus:border-white/50
            "
          />

          {/* Email */}

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="
              w-full
              bg-transparent
              border
              border-white/20
              rounded-full
              px-4
              py-3
              text-sm
              placeholder:text-white/40
              focus:outline-none
              focus:border-white/50
            "
          />

          {/* Message */}

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Write your message..."
            required
            rows={4}
            className="
              w-full
              bg-transparent
              border
              border-white/20
              rounded-xl
              px-4
              py-3
              text-sm
              placeholder:text-white/40
              focus:outline-none
              focus:border-white/50
              resize-none
            "
          />

          {/* Send Button */}

          <button
            type="submit"
            className="
              w-full
              border
              border-white/20
              rounded-full
              py-3
              text-xs
              font-bold
              uppercase
              hover:border-white/50
              hover:bg-white
              hover:text-black
              transition
            "
          >
            Send Message
          </button>

        </form>


        {/* Follow Us */}

        <h3 className="
          text-xs
          font-bold
          tracking-wide
          uppercase
          mt-10
          mb-4
        ">
          Follow Us
        </h3>


        <div className="flex items-center gap-3">

         


          {/* TikTok */}

          <a
            href="https://www.tiktok.com/@framex10x"
            className="
              w-9
              h-9
              rounded-full
              border
              border-white/20
              flex
              items-center
              justify-center
              hover:border-white/50
              transition-colors
              text-lg
            "
          >
            <FaTiktok />
          </a>


          {/* WhatsApp */}

          <a
            href="https://wa.me/201033199897"
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-9
              h-9
              rounded-full
              border
              border-white/20
              flex
              items-center
              justify-center
              hover:border-white/50
              transition-colors
              text-lg
            "
          >
            <FaWhatsapp />
          </a>

        </div>

      </div>


      {/* Bottom Footer */}

      <div className="border-t border-white/10">

        <div className="
          max-w-7xl
          mx-auto
          px-6
          py-5
          flex
          flex-col
          sm:flex-row
          items-center
          justify-between
          gap-3
          text-xs
          text-white/50
        ">

          {/* Copyright */}

          <span>
            © {new Date().getFullYear()} FRAMEX. All Rights Reserved
          </span>


          {/* Developer */}

          <span>

            Powered by{" "}

            <a
              href="https://moamenosama10.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-white/70
                hover:text-white
                transition
              "
            >
              MoamenOsama
            </a>

          </span>


          {/* Payment */}

          <div className="flex items-center gap-2">

            <span className="
              border
              border-white/20
              rounded
              px-2
              py-1
            ">
              VISA
            </span>

            <span className="
              border
              border-white/20
              rounded
              px-2
              py-1
            ">
              Mastercard
            </span>

            <span className="
              border
              border-white/20
              rounded
              px-2
              py-1
            ">
              Fawry
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}