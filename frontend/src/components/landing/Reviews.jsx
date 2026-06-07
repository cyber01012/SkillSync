import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, User } from "lucide-react";

const reviews = [
  { name: "Suhaima", role: "Full Stack Developer", content: "SkillmatriX identified exactly which AWS services I was missing for Senior roles. The roadmap they provided was a game changer.", rating: 5 },
  { name: "Hafsa", role: "UX Designer", content: "The resume parsing is incredibly accurate. It caught skills I didn't even think to highlight but were relevant to my field.", rating: 5 },
  { name: "Nimra", role: "Data Scientist", content: "Finally, a platform that doesn't just show me jobs, but tells me how to qualify for them. The AI counselor is surprisingly insightful.", rating: 4 },
  { name: "Misha", role: "Product Manager", content: "The AI career coach helped me identify skill gaps I never noticed. Absolutely recommend!", rating: 5 },
  { name: "Ali", role: "Software Engineer", content: "The recommendations and skill gap analysis are precise. It helped me plan my career path efficiently.", rating: 5 },
  { name: "Sara", role: "UI Designer", content: "I loved how the AI coach suggested specific improvements to my portfolio. Very insightful!", rating: 4 },
];

export default function Reviews() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-20 relative z-20">
        <h2 className="text-[#3D418A] font-bold tracking-widest uppercase text-sm mb-4">
          Testimonials
        </h2>
        <h3 className="text-4xl md:text-6xl font-black text-[#3D418A] mb-6">
          Loved by <span className="text-[#c86ad9] italic">ambitious</span>{" "}
          professionals.
        </h3>
      </div>

      {/* Soft edges blur */}
      <div className="pointer-events-none absolute left-0 top-1/4 h-2/3 w-12 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:1px_70px] animate-vertical-lines-soft" />
      </div>
      <div className="pointer-events-none absolute right-0 top-1/4 h-2/3 w-12 z-50">
        <div className="absolute inset-0 bg-gradient-to-l from-white/50 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:1px_70px] animate-vertical-lines-soft" />
      </div>

      {/* Marquee rows */}
      <div className="relative space-y-12">
        {/* Row 1 */}
        <motion.div
          className="flex gap-10 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 90, ease: "linear", repeat: Infinity }} // slower
        >
          {[...reviews, ...reviews].map((review, index) => (
            <ReviewCard key={`row1-${index}`} review={review} />
          ))}
        </motion.div>

        {/* Row 2 */}
        <motion.div
          className="flex gap-10 w-max pl-32"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 100, ease: "linear", repeat: Infinity }} // slower
        >
          {[...reviews, ...reviews].map((review, index) => (
            <ReviewCard key={`row2-${index}`} review={review} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ReviewCard({ review }) {
  return (
    <div
      className="inline-block px-10 py-10 rounded-[2.75rem] bg-white/40 border border-[#c86ad6]/10 shadow-xl shadow-[#3D418A]/5 backdrop-blur-sm"
      style={{ width: "fit-content", maxWidth: "460px" }}
    >
      <Quote className="absolute top-8 right-10 text-[#c86ad6]/10 w-14 h-14" />
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < review.rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-[#4b4faf]/20"
            }`}
          />
        ))}
      </div>
      <p className="text-[#2a2ea0] text-lg font-medium italic mb-10 leading-relaxed">
        "{review.content}"
      </p>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 p-[2px] shadow-md flex items-center justify-center">
          <User className="w-8 h-8 text-[#4144A3]/60" /> {/* soft solid color */}
        </div>
        <div>
          <h4 className="text-[#4b4faf] font-black text-lg">{review.name}</h4>
          <p className="text-[#2a2ea0]/50 text-sm font-bold uppercase tracking-widest">
            {review.role}
          </p>
        </div>
      </div>
    </div>
  );
}
