import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

interface Experience {
  title: string;
  company: string;
  location: string;
  dates: string;
  achievements: string[];
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  graduation_date: string;
}

interface Skills {
  technical: string[];
  soft: string[];
}

interface Additional {
  content: string[];
}

interface PersonalInfo {
  name: string;
  email: string;
}

export interface Resume {
  summary: string;
  experience: Experience[];
  skills: Skills;
  education: Education[];
  additional: Additional;
  personalInfo: PersonalInfo;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1pt solid #ccc',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 12,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
    borderBottom: '1pt solid #eee',
    paddingBottom: 5,
  },
  experienceItem: {
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 12,
    fontWeight: 'semibold',
  },
  dates: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  achievementsList: {
    marginLeft: 15,
    marginTop: 5,
  },
  achievementItem: {
    marginBottom: 3,
    fontSize: 11,
  },
  bulletPoint: {
    width: 10,
  },
  skillsSection: {
    marginBottom: 10,
  },
  skillsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    marginRight: 5,
    fontSize: 11,
  },
  educationItem: {
    marginBottom: 10,
  },
  degreeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  institution: {
    fontSize: 12,
  },
  summary: {
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'justify',
    marginBottom: 5,
  },
});

const parseResumeContent = (resumeContent: Resume) => {
  try {
    return {
      personal_info: resumeContent.personalInfo || {},
      summary: resumeContent.summary || '',
      experience: Array.isArray(resumeContent.experience)
        ? resumeContent.experience.map((exp: any) => ({
            title: exp.title || '',
            company: exp.company || '',
            location: exp.location || '',
            dates: exp.dates || '',
            achievements: Array.isArray(exp.achievements)
              ? exp.achievements
              : [],
          }))
        : [],
      skills: {
        technical: Array.isArray(resumeContent.skills?.technical)
          ? resumeContent.skills.technical
          : [],
        soft: Array.isArray(resumeContent.skills?.soft)
          ? resumeContent.skills.soft
          : [],
      },
      education: Array.isArray(resumeContent.education)
        ? resumeContent.education.map((edu: any) => ({
            degree: edu.degree || '',
            institution: edu.institution || '',
            location: edu.location || '',
            graduation_date: edu.graduation_date || '',
          }))
        : [],
    };
  } catch (error) {
    console.error('Error parsing resume content:', error);
    return {};
  }
};

const CVDocument = ({ resumeContent }: { resumeContent: Resume }) => {
  const parsedResume = parseResumeContent(resumeContent);

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header - Name & Contact Information */}
        <View style={styles.header}>
          <Text style={styles.name}>{parsedResume.personal_info?.name}</Text>
          <Text style={styles.contactInfo}>
            {parsedResume.personal_info?.email}
          </Text>
        </View>

        {/* Summary Section */}
        <View>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{parsedResume.summary}</Text>
        </View>

        {/* Experience Section */}
        <View>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {parsedResume.experience?.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <Text style={styles.jobTitle}>{exp.title}</Text>
              <Text style={styles.company}>
                {exp.company} {exp.location ? `- ${exp.location}` : ''}
              </Text>
              <Text style={styles.dates}>{exp.dates}</Text>
              <View style={styles.achievementsList}>
                {exp.achievements.map((achievement: string, i: number) => (
                  <View key={i} style={{ flexDirection: 'row' }}>
                    <Text style={styles.bulletPoint}>• </Text>
                    <Text style={styles.achievementItem}>{achievement}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Skills Section */}
        <View>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsSection}>
            <Text style={styles.skillsTitle}>Technical Skills</Text>
            <View style={styles.skillsList}>
              {parsedResume.skills?.technical.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  {skill}
                  {index < parsedResume.skills.technical.length - 1
                    ? ' • '
                    : ''}
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.skillsSection}>
            <Text style={styles.skillsTitle}>Soft Skills</Text>
            <View style={styles.skillsList}>
              {parsedResume.skills?.soft.map((skill, index) => (
                <Text key={index} style={styles.skillItem}>
                  {skill}
                  {index < parsedResume.skills.soft.length - 1 ? ' • ' : ''}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Education Section */}
        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          {parsedResume.education?.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={styles.degreeTitle}>{edu.degree}</Text>
              <Text style={styles.institution}>
                {edu.institution} {edu.location ? `- ${edu.location}` : ''}
              </Text>
              <Text style={styles.dates}>{edu.graduation_date}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
export default CVDocument;
