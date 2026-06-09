import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, User } from "lucide-react";

const reviews = [
  { name: "Ahmed R.", role: "Full Stack Developer", content: "The Trust Score replaced my entire portfolio. Clients now hire me based on verified proof-of-work replays, not just my resume. Game changer.", rating: 5 },
  { name: "Sarah K.", role: "UX Designer", content: "Live challenges showed my real process to clients. I got hired within 48 hours of completing my first challenge — no portfolio needed.", rating: 5 },
  { name: "Omar H.", role: "Data Scientist", content: "The Skill DNA fingerprint accurately captured my work style. The matching agent connected me with a client who specifically needed my approach.", rating: 5 },
  { name: "Maya T.", role: "Product Manager", content: "As a client, I can watch proof-of-work replays before hiring. I've cut my vetting time by 80% and my project success rate has doubled.", rating: 5 },
  { name: "Zain A.", role: "Mobile Developer", content: "The escrow and milestone system with automatic payment release means I never chase invoices. The Payment Release Agent handles everything.", rating: 5 },
  { name: "Leila M.", role: "Content Strategist", content: "Fraud Detection caught an AI-generated submission on my project immediately. The platform's integrity protection is unmatched.", rating: 5 },
];

export default function Reviews() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
      <div className="text-center mb-20 relative z-20">
        <h2 className="text-[#133B6C] font-bold tracking-widest uppercase text-sm mb-4">
          Testimonials
        </h2>
        <h3 className="text-4xl md:text-6xl font-black text-[#133B6C] mb-6">
          Loved by <span className="text-[#FD8566] italic">verified</span>{" "}
          professionals.
        </h3>
      </div>

      <div className="pointer-events-none absolute left-0 top-1/4 h-2/3 w-12 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8F5]/80 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,248,245,0.12)_1px,transparent_1px)] bg-[size:1px_70px] animate-vertical-lines-soft" />
      </div>
      <div className="pointer-events-none absolute right-0 top-1/4 h-2/3 w-12 z-50">
        <div className="absolute inset-0 bg-gradient-to-l from-[#FFF8F5]/80 to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,248,245,0.12)_1px,transparent_1px)] bg-[size:1px_70px] animate-vertical-lines-soft" />
      </div>

      <div className="relative space-y-12">
        <motion.div
          className="flex gap-10 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 90, ease: "linear", repeat: Infinity }}
        >
          {[...reviews, ...reviews].map((review, index) => (
            <ReviewCard key={`row1-${index}`} review={review} />
          ))}
        </motion.div>

        <motion.div
          className="flex gap-10 w-max pl-32"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 100, ease: "linear", repeat: Infinity }}
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
      className="inline-block px-10 py-10 rounded-[2.75rem] bg-white/80 border border-[#FD8566]/10 shadow-xl shadow-[#133B6C]/5 backdrop-blur-sm"
      style={{ width: "fit-content", maxWidth: "460px" }}
    >
      <Quote className="absolute top-8 right-10 text-[#FD8566]/10 w-14 h-14" />
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < review.rating
                ? "text-[#FD8566] fill-[#FD8566]"
                : "text-[#133B6C]/20"
            }`}
          />
        ))}
      </div>
      <p className="text-[#133B6C] text-lg font-medium italic mb-10 leading-relaxed">
        "{review.content}"
      </p>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#FFF0EC] p-[2px] shadow-md flex items-center justify-center">
          <User className="w-8 h-8 text-[#133B6C]/60" />
        </div>
        <div>
          <h4 className="text-[#133B6C] font-black text-lg">{review.name}</h4>
          <p className="text-[#4A6582]/70 text-sm font-bold uppercase tracking-widest">
            {review.role}
          </p>
        </div>
      </div>
    </div>
  );
}