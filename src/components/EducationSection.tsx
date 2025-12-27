import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section id="education" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-foreground" />
              <span className="text-sm text-muted-foreground font-body">Education</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-foreground">
              Academic Journey
            </h2>
          </div>
          <div className="lg:text-right">
            <p className="text-base text-muted-foreground font-body leading-relaxed max-w-md lg:ml-auto">
              A strong academic foundation combined with hands-on experience in technology, leadership, and innovation.
            </p>
          </div>
        </div>

        {/* Education List */}
        <Accordion type="single" collapsible>
          {educationData.map((edu, index) => (
            <AccordionItem
              key={index}
              value={`edu-${index}`}
              className="border-t border-border last:border-b hover:bg-tertiary/50 transition-colors -mx-6 px-6 lg:-mx-20 lg:px-20"
            >
              <AccordionTrigger className="py-8 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
                <div className="grid lg:grid-cols-12 gap-4 items-center w-full text-left">
                  {/* Degree & Period */}
                  <div className="lg:col-span-5">
                    <h3 className="font-display text-lg font-light text-foreground">
                      {edu.degree}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body mt-1">
                      • {edu.period}
                    </p>
                  </div>

                  {/* Institution */}
                  <div className="lg:col-span-4">
                    <p className="text-sm text-muted-foreground font-body">
                      {edu.institution}
                    </p>
                  </div>

                  {/* Score & Location */}
                  <div className="lg:col-span-3 flex justify-end gap-2 items-center">
                    <span className="px-3 py-1.5 text-xs font-body border border-border rounded-full">
                      {edu.scoreLabel}: {edu.score}
                    </span>
                    <span className="px-3 py-1.5 text-xs font-body border border-border rounded-full hidden md:inline-block">
                      {edu.location}
                    </span>
                    <ChevronDown className="chevron h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ml-2" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-8">
                <div className="lg:pl-[calc(41.666%+1rem)] space-y-6">
                  {/* Coursework */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Relevant Coursework
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {edu.coursework.map((course, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-tertiary text-xs text-muted-foreground rounded-full font-body hover:text-foreground hover:bg-foreground hover:text-primary-foreground transition-colors cursor-default"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Achievements & Activities
                    </h4>
                    <ul className="space-y-2">
                      {edu.achievements.map((achievement, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground font-body flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default EducationSection;
