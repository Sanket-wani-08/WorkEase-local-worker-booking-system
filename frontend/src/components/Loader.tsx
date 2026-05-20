import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary">
      <div className="relative">
        <motion.div
          animate={{
            rotate: [0, -20, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-accent mb-4"
        >
          <Hammer className="w-16 h-16" />
        </motion.div>
        
        <div className="flex space-x-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-accent rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;
