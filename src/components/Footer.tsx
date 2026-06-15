'use client';

import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';

// Replace with your own name and GitHub link
const DEVELOPER_NAME = 'Your Name';
const DEVELOPER_GITHUB = 'https://github.com/yourusername';
const COPYRIGHT_YEAR = new Date().getFullYear();
const ARTIST_NAME = 'Your Name';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Made with love */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center space-x-2 text-gray-400"
          >
            <span className="font-editorial-pro">Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart size={18} className="text-red-500" />
            </motion.div>
            <span className="font-editorial-pro">by</span>
            <a
              href={DEVELOPER_GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-red-400 transition-colors duration-200 font-editorial-pro font-semibold flex items-center space-x-1 group"
            >
              <span>{DEVELOPER_NAME}</span>
              <ExternalLink size={14} className="group-hover:scale-110 transition-transform duration-200" />
            </a>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-gray-400 text-sm font-editorial-pro"
          >
            &copy; {COPYRIGHT_YEAR} {ARTIST_NAME}. All rights reserved.
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
