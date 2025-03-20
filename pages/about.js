import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import siteConfig from '../site.config';

export default function About() {
  const { about } = siteConfig;
  const { sections } = about;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8">{about.title}</h1>
          <p className="text-xl text-gray-600 mb-12">{about.description}</p>

          <div className="prose prose-lg">
            <p>{about.content.intro}</p>

            {sections.skills.show && (
              <>
                <h2 className="text-2xl font-bold mt-8 mb-4">{sections.skills.title}</h2>
                <ul className="grid grid-cols-2 gap-4">
                  {about.content.skills.map((skill, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {sections.experience.show && (
              <>
                <h2 className="text-2xl font-bold mt-8 mb-4">{sections.experience.title}</h2>
                {about.content.experience.map((exp, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-xl font-semibold">{exp.title}</h3>
                    <p className="text-gray-600">{exp.company} · {exp.period}</p>
                    <p className="mt-2">{exp.description}</p>
                  </div>
                ))}
              </>
            )}

            {sections.education.show && (
              <>
                <h2 className="text-2xl font-bold mt-8 mb-4">{sections.education.title}</h2>
                <div>
                  <h3 className="text-xl font-semibold">{about.content.education.degree}</h3>
                  <p className="text-gray-600">
                    {about.content.education.school} · {about.content.education.year}
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 