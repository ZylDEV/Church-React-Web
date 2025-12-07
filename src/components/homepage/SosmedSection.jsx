import { FiYoutube } from "react-icons/fi";
import { motion } from "framer-motion";

export default function SosmedSection() {
  return (
    <motion.section
      className="max-w-xl mx-auto my-20 px-8 py-12 relative"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Ikuti kami di media sosial"
    >
      {/* Main container with advanced glassmorphism */}
      <div className="relative bg-gradient-to-br from-white/90 via-white/70 to-white/50 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] border border-white/40 p-8 overflow-hidden">
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-red-400/30 to-pink-500/30 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 0.8, 1.2, 1],
            rotate: [360, 180, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-500/40 to-red-500/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Enhanced title with stagger animation */}
        <motion.h2 
          className="text-4xl md:text-5xl font-extrabold text-blue-950 mb-12 tracking-tight text-center drop-shadow-lg relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="inline-block"
            animate={{
              textShadow: [
                "0 0 0px rgba(59, 130, 246, 0)",
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 0px rgba(59, 130, 246, 0)"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Ikuti Kami di Media Sosial
          </motion.span>
        </motion.h2>
        
        {/* Premium YouTube button */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-5 bg-gradient-to-r from-white via-gray-50 to-white border-2 border-gray-200/60 rounded-[24px] px-10 py-6 mx-auto max-w-max
              transition-all duration-700 hover:shadow-[0_20px_40px_-12px_rgba(239,68,68,0.4)] hover:border-red-400/60 focus:outline-none focus:ring-4 focus:ring-red-400/30"
            aria-label="YouTube Gereja"
            whileHover={{ 
              scale: 1.08,
              rotateX: 5,
              rotateY: 5
            }}
            whileTap={{ 
              scale: 0.95,
              rotateX: 0,
              rotateY: 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25,
              mass: 0.8
            }}
            style={{
              transformStyle: "preserve-3d"
            }}
          >
            {/* Animated background layers */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 rounded-[24px] opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.5 }}
            />
            
            {/* Moving shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-[24px] -skew-x-12"
              initial={{ x: "-200%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut"
              }}
            />

            {/* Premium YouTube icon with complex animation */}
            <motion.div
              className="relative"
              whileHover={{
                rotate: [0, -15, 15, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {/* Pulsing background rings */}
              <motion.div
                className="absolute inset-0 -m-2"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0.4)",
                    "0 0 0 8px rgba(239, 68, 68, 0)",
                    "0 0 0 0 rgba(239, 68, 68, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                style={{ borderRadius: "50%" }}
              />
              
              {/* Icon with enhanced styling */}
              <motion.div
                className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-xl shadow-lg"
                whileHover={{ 
                  boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.5)" 
                }}
              >
                <FiYoutube size={32} className="text-white" />
              </motion.div>
            </motion.div>

            {/* Enhanced text with subtle animation */}
            <motion.span 
              className="text-blue-950 font-bold text-xl transition-all duration-500 group-hover:text-blue-900 relative"
              whileHover={{ 
                x: 3,
                textShadow: "0 4px 8px rgba(30, 58, 138, 0.2)"
              }}
            >
              YouTube Gereja
              
              {/* Underline effect */}
              <motion.div
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.span>

            {/* Premium corner accent */}
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full opacity-0 group-hover:opacity-100"
              initial={{ scale: 0 }}
              whileHover={{ 
                scale: 1,
                boxShadow: "0 0 12px rgba(239, 68, 68, 0.6)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 20 
              }}
            />
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}