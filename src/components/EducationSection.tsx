import { GraduationCap, MapPin, Calendar, Award, BookOpen } from "lucide-react";

interface Education {
  degree: string;
  institution: string;
  period: string;
  location: string;
  score: string;
  scoreLabel: string;
  coursework: string[];
  achievements: string[];
}

const educationData: Education[] = [
  {
    degree: "Bachelor of Technology in Mechanical Engineering",
    institution: "National Institute of Technology, Hamirpur, Himachal Pradesh",
    period: "August 2023 - Expected May 2027",
    location: "Hamirpur, HP",
    score: "7.3/10",
    scoreLabel: "GPA",
    coursework: [
      "Fluid Mechanics",
      "Manufacturing Processes",
      "Acoustics",
      "Industrial Engineering",
      "Machine Drawing",
      "Kinematics of Machines (KOM)",
    ],
    achievements: [
      "Executive Member at E-CELL NIT Hamirpur",
      "Dean's List: Web Development and AI Integration",
      "Participated in various hackathons and coding competitions",
    ],
  },
  {
    degree: "High School Diploma in Science",
    institution: "St. Paul's School, Nagpur",
    period: "August 2020 - May 2022",
    location: "Nagpur, Maharashtra",
    score: "93.8%",
    scoreLabel: "Percentage",
    coursework: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Computer Science",
      "Environmental Science",
      "English",
    ],
    achievements: [
      "President of Computer Science Club",
      "Graduated with highest honors",
    ],
  },
  {
    degree: "Junior School Diploma in Science",
    institution: "Sanskar Vidya Sagar, Nagpur",
    period: "August 2007 - June 2020",
    location: "Nagpur, Maharashtra",
    score: "89%",
    scoreLabel: "Percentage",
    coursework: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Computer Science",
      "Environmental Science",
      "English",
    ],
    achievements: [
      "Head of Green House",
      "Graduated with highest honors",
    ],
  },
];

const EducationSection = () => {
  return (
    <section id="education" className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="pill-tag mb-4">Education</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Academic Journey
          </h2>
        </div>

        {/* Education Cards */}
        <div className="max-w-4xl mx-auto space-y-8">
          {educationData.map((edu, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 md:p-8 border border-border hover-lift card-shadow"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground">
                      {edu.degree}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-lg ml-13 md:ml-[52px]">
                    {edu.institution}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{edu.period}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{edu.location}</span>
                  </div>
                </div>
              </div>

              {/* Score Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium mb-6">
                <Award className="w-4 h-4" />
                {edu.scoreLabel}: {edu.score}
              </div>

              {/* Coursework */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Relevant Coursework
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {edu.coursework.map((course, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Achievements & Activities
                  </span>
                </div>
                <ul className="space-y-2">
                  {edu.achievements.map((achievement, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-muted-foreground text-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;
