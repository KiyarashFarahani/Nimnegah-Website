'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { customFont, editorialPro } from '@/lib/fonts';

// Replace with your own bio, skills, and profile image
const PROFILE_IMAGE = '/images/profile/photo.jpg';
const BIO_PARAGRAPHS = [
  'Write your bio here. Tell visitors about yourself, your background, and what drives your art.',
  'Add more details about your experience, education, and artistic journey.',
];
const EXPERIENCE = [
  'Your experience or achievements go here',
];
const SKILLS = [
  'Skill 1',
  'Skill 2',
  'Skill 3',
  'Skill 4',
  'Skill 5',
];

const About = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={PROFILE_IMAGE}
                alt="Artist Portrait"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-pink-400 to-yellow-400 rounded-full opacity-20"></div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className={`text-4xl sm:text-5xl ${customFont.className} font-bold text-gray-900 mb-6 text-right`}>
              About Me
            </h2>

            <div className={`space-y-6 text-gray-600 leading-relaxed ${editorialPro.className} text-right`}>
              {BIO_PARAGRAPHS.map((paragraph, index) => (
                <p key={index} className="text-lg">
                  {paragraph}
                </p>
              ))}

              <div>
                {EXPERIENCE.map((item, index) => (
                  <p key={index}>
                    {item}
                  </p>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="mt-8">
              <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${customFont.className} text-right`}>Skills & Expertise</h3>
              <div className="flex flex-wrap gap-3">
                {SKILLS.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-200"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
        </motion.div>
      </div>
    </section>
  );
};

export default About;
