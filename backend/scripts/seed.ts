import mongoose from 'mongoose';
import 'dotenv/config';
import { User } from '../src/models/User';
import { Assignment } from '../src/models/Assignment';
import { Rubric } from '../src/models/Rubric';
import { Submission } from '../src/models/Submission';
import { Feedback } from '../src/models/Feedback';

/**
 * Seed Script for Smart Assignment System
 *
 * This script populates the database with dummy data for development and testing.
 * It maintains all proper references between collections.
 */

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://AnuragSingh722:Anurag12345@cluster0.d9eauiq.mongodb.net/assignment?appName=Cluster0';

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Assignment.deleteMany({}),
      Rubric.deleteMany({}),
      Submission.deleteMany({}),
      Feedback.deleteMany({})
    ]);

    // 1. Create Users (Teachers and Students)
    console.log('👥 Creating users...');
    const users = await User.insertMany([
      // Teachers
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'Dr. Emily Davis',
        email: 'emily.davis@university.edu',
        password: 'teacher123',
        role: 'teacher'
      },

      // Students
      {
        name: 'Alice Thompson',
        email: 'alice.thompson@student.edu',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@student.edu',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.brown@student.edu',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Diana Prince',
        email: 'diana.prince@student.edu',
        password: 'student123',
        role: 'student'
      },
      {
        name: 'Edward Norton',
        email: 'edward.norton@student.edu',
        password: 'student123',
        role: 'student'
      }
    ]);

    const teachers = users.filter(user => user.role === 'teacher');
    const students = users.filter(user => user.role === 'student');

    console.log(`✅ Created ${teachers.length} teachers and ${students.length} students`);

    // 2. Create Assignments
    console.log('📝 Creating assignments...');
    const assignments = await Assignment.insertMany([
      {
        title: 'Essay: The Impact of Technology on Education',
        description: 'Write a 1000-word essay discussing how technology has transformed modern education. Include examples from online learning platforms, AI tutoring systems, and digital collaboration tools. Analyze both the benefits and challenges of technological integration in educational settings.',
        teacherId: teachers[0]!._id.toString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        allowedSubmissionType: 'TEXT',
        maxScore: 100,
        isPublished: true
      },
      {
        title: 'Research Paper: Climate Change Solutions',
        description: 'Conduct research on innovative solutions to combat climate change. Your paper should include scientific data, economic analysis, and policy recommendations. Focus on renewable energy technologies and their potential impact on global emissions reduction.',
        teacherId: teachers[1]!._id.toString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        allowedSubmissionType: 'TEXT',
        maxScore: 150,
        isPublished: true
      },
      {
        title: 'Programming Assignment: Data Structures Implementation',
        description: 'Implement fundamental data structures (Stack, Queue, Linked List, Binary Tree) in your preferred programming language. Include comprehensive unit tests and documentation. Demonstrate the efficiency of each implementation with time/space complexity analysis.',
        teacherId: teachers[2]!._id.toString(),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        allowedSubmissionType: 'TEXT',
        maxScore: 200,
        isPublished: true
      },
      {
        title: 'Project Report: Upload Your Final Report',
        description: 'Submit your final project report as a PDF or DOCX file. The report should include your research findings, methodology, results, and conclusions. Make sure to include proper citations and references.',
        teacherId: teachers[0]!._id.toString(),
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        allowedSubmissionType: 'FILE',
        maxScore: 120,
        isPublished: true
      },
      {
        title: 'Portfolio Submission: Design Files',
        description: 'Upload your design portfolio containing at least 5 design projects. Acceptable formats: PDF, ZIP (containing multiple files), or DOCX. Include project descriptions and your design process for each project.',
        teacherId: teachers[1]!._id.toString(),
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
        allowedSubmissionType: 'FILE',
        maxScore: 100,
        isPublished: true
      },
      {
        title: 'Creative Writing: Short Story',
        description: 'Write an original short story (1500-2000 words) that explores themes of identity and belonging. Focus on character development and use descriptive language to create vivid imagery.',
        teacherId: teachers[1]!._id.toString(),
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        allowedSubmissionType: 'TEXT',
        maxScore: 80,
        isPublished: false
      }
    ]);

    console.log(`✅ Created ${assignments.length} assignments`);

    // 3. Create Rubrics (one per assignment)
    console.log('📊 Creating rubrics...');
    const rubrics = await Rubric.insertMany([
      {
        assignmentId: assignments[0]!._id.toString(),
        criteria: [
          {
            name: 'Content Quality',
            maxScore: 40,
            description: 'Depth of analysis, use of relevant examples, and clarity of arguments'
          },
          {
            name: 'Structure and Organization',
            maxScore: 25,
            description: 'Logical flow, clear introduction/conclusion, and coherent paragraphs'
          },
          {
            name: 'Research and Evidence',
            maxScore: 20,
            description: 'Use of credible sources and proper citation'
          },
          {
            name: 'Grammar and Style',
            maxScore: 15,
            description: 'Language proficiency, spelling, and academic writing style'
          }
        ]
      },
      {
        assignmentId: assignments[1]!._id.toString(),
        criteria: [
          {
            name: 'Research Depth',
            maxScore: 50,
            description: 'Thoroughness of research and use of scientific data'
          },
          {
            name: 'Analysis Quality',
            maxScore: 40,
            description: 'Critical thinking and interpretation of data'
          },
          {
            name: 'Writing Quality',
            maxScore: 30,
            description: 'Clarity, structure, and academic writing standards'
          },
          {
            name: 'Originality',
            maxScore: 30,
            description: 'Unique insights and innovative approaches'
          }
        ]
      },
      {
        assignmentId: assignments[2]!._id.toString(),
        criteria: [
          {
            name: 'Code Quality',
            maxScore: 60,
            description: 'Clean, readable, and well-documented code'
          },
          {
            name: 'Functionality',
            maxScore: 50,
            description: 'Correct implementation of all required data structures'
          },
          {
            name: 'Testing',
            maxScore: 40,
            description: 'Comprehensive unit tests and edge case coverage'
          },
          {
            name: 'Analysis',
            maxScore: 50,
            description: 'Time/space complexity analysis and performance evaluation'
          }
        ]
      },
      {
        assignmentId: assignments[3]!._id.toString(),
        criteria: [
          {
            name: 'Market Analysis',
            maxScore: 30,
            description: 'Thorough market research and competitive analysis'
          },
          {
            name: 'Financial Planning',
            maxScore: 35,
            description: 'Realistic financial projections and cost analysis'
          },
          {
            name: 'Business Strategy',
            maxScore: 30,
            description: 'Clear value proposition and strategic positioning'
          },
          {
            name: 'Presentation',
            maxScore: 25,
            description: 'Professional formatting and clarity of communication'
          }
        ]
      },
      {
        assignmentId: assignments[4]!._id.toString(),
        criteria: [
          {
            name: 'Report Quality',
            maxScore: 40,
            description: 'Clarity, structure, and professional presentation'
          },
          {
            name: 'Content Depth',
            maxScore: 35,
            description: 'Thoroughness of research and analysis'
          },
          {
            name: 'Citations and References',
            maxScore: 25,
            description: 'Proper academic citation format'
          },
          {
            name: 'File Format and Presentation',
            maxScore: 20,
            description: 'Professional formatting and document structure'
          }
        ]
      },
      {
        assignmentId: assignments[5]!._id.toString(),
        criteria: [
          {
            name: 'Creativity and Originality',
            maxScore: 30,
            description: 'Unique story concept and creative writing elements'
          },
          {
            name: 'Character Development',
            maxScore: 25,
            description: 'Depth and consistency of character portrayal'
          },
          {
            name: 'Plot and Structure',
            maxScore: 20,
            description: 'Engaging storyline and narrative coherence'
          },
          {
            name: 'Language and Style',
            maxScore: 15,
            description: 'Descriptive language and literary techniques'
          }
        ]
      }
    ]);

    console.log(`✅ Created ${rubrics.length} rubrics`);

    // 4. Create Submissions
    console.log('📤 Creating submissions...');
    const submissions = await Submission.insertMany([
      // Assignment 1 submissions
      {
        assignmentId: assignments[0]!._id.toString(),
        studentId: students[0]!._id.toString(),
        content: 'Technology has revolutionized education in unprecedented ways. Online learning platforms like Coursera and edX have democratized access to quality education, allowing learners from any location to access courses from top universities. AI-powered tutoring systems provide personalized learning experiences, adapting to individual student needs and learning paces. Digital collaboration tools like Google Workspace and Microsoft Teams have transformed group work, enabling real-time collaboration across geographical boundaries. However, this technological integration also presents challenges. The digital divide remains a significant barrier, with many students lacking access to reliable internet or devices. Additionally, concerns about data privacy and screen time effects on student health continue to be important considerations. Despite these challenges, the benefits of technology in education are clear. Enhanced accessibility, personalized learning, and improved collaboration tools have created more inclusive and effective educational environments. As we look to the future, continued innovation in educational technology will be crucial for preparing students for an increasingly digital world.',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        version: 1,
        status: 'EVALUATED',
        score: 92
      },
      {
        assignmentId: assignments[0]!._id.toString(),
        studentId: students[1]!._id.toString(),
        content: 'The integration of technology in education has been both transformative and controversial. On one hand, digital tools have expanded access to educational resources beyond traditional classroom boundaries. Students can now learn at their own pace through adaptive learning platforms that adjust content difficulty based on performance. Virtual reality simulations provide immersive learning experiences that traditional textbooks cannot match. Collaborative online platforms facilitate global classroom discussions and cross-cultural exchanges. On the other hand, technology introduces new challenges to the educational landscape. Increased screen time has raised concerns about student health and attention spans. The reliance on digital devices creates equity issues, as not all students have equal access to technology. Furthermore, the abundance of online information makes it challenging for students to discern credible sources from misinformation. Despite these challenges, technology\'s role in education continues to evolve. Emerging technologies like artificial intelligence and blockchain have the potential to further revolutionize how we teach and learn. The key to successful technology integration lies in thoughtful implementation that addresses both opportunities and challenges.',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        version: 1,
        status: 'EVALUATED',
        score: 88
      },

      // Assignment 2 submissions
      {
        assignmentId: assignments[1]!._id.toString(),
        studentId: students[2]!._id.toString(),
        content: 'Climate change represents one of the most pressing challenges of our time, requiring innovative solutions across multiple sectors. Renewable energy technologies offer promising pathways to reduce greenhouse gas emissions and transition to sustainable energy systems. Solar and wind power have seen dramatic cost reductions, making them increasingly competitive with fossil fuels. Advanced energy storage solutions, including lithium-ion batteries and emerging technologies like flow batteries, are crucial for managing the intermittent nature of renewable energy sources. Beyond energy, innovative solutions in agriculture, transportation, and industrial processes are essential. Precision agriculture using IoT sensors and AI can optimize resource use and reduce emissions. Electric vehicles and hydrogen fuel cells offer cleaner transportation alternatives. Carbon capture and utilization technologies provide methods to remove CO2 from the atmosphere and repurpose it in industrial processes. However, implementing these solutions requires coordinated policy frameworks and substantial investments. Governments play a critical role in creating incentives for clean technology adoption and supporting research and development. International cooperation is essential, as climate change transcends national boundaries. The transition to a low-carbon economy presents both challenges and opportunities for innovation and economic growth.',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        version: 1,
        status: 'SUBMITTED'
      },

      // Assignment 3 submissions
      {
        assignmentId: assignments[2]!._id.toString(),
        studentId: students[3]!._id.toString(),
        content: '```javascript\n// Stack implementation with TypeScript\nclass Stack<T> {\n  private items: T[] = [];\n\n  push(element: T): void {\n    this.items.push(element);\n  }\n\n  pop(): T | undefined {\n    return this.items.pop();\n  }\n\n  peek(): T | undefined {\n    return this.items[this.items.length - 1];\n  }\n\n  isEmpty(): boolean {\n    return this.items.length === 0;\n  }\n\n  size(): number {\n    return this.items.length;\n  }\n\n  clear(): void {\n    this.items = [];\n  }\n}\n\n// Time Complexity: O(1) for all operations\n// Space Complexity: O(n) where n is the number of elements\n\nexport default Stack;\n```',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        version: 1,
        status: 'EVALUATED',
        score: 175
      },

      // Assignment 4 submissions
      {
        assignmentId: assignments[3]!._id.toString(),
        studentId: students[4]!._id.toString(),
        content: '# EcoTech Solutions - Business Plan\n\n## Executive Summary\nEcoTech Solutions is a startup focused on developing affordable smart home energy management systems for residential customers. Our mission is to reduce household energy consumption by 30% through intelligent automation and user-friendly interfaces.\n\n## Market Analysis\nThe global smart home market is projected to reach $135 billion by 2025, with energy management systems representing a significant portion. Current solutions are often expensive and complex, creating an opportunity for affordable, user-friendly alternatives.\n\n## Product Description\nOur flagship product, EcoHub, is a central energy management controller that integrates with existing smart devices and provides real-time energy monitoring and automated optimization.\n\n## Financial Projections\n- Year 1 Revenue: $2.5M\n- Year 2 Revenue: $8.3M\n- Year 3 Revenue: $18.7M\n- Break-even: Month 18\n- Initial Investment Required: $1.2M\n\n## Marketing Strategy\nTarget environmentally conscious homeowners aged 25-45 through social media campaigns, partnerships with home improvement stores, and content marketing focused on energy savings.',
        submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        version: 1,
        status: 'SUBMITTED'
      }
    ]);

    console.log(`✅ Created ${submissions.length} submissions`);

    // 5. Create Feedback
    console.log('💬 Creating feedback...');
    const feedbacks = await Feedback.insertMany([
      {
        submissionId: submissions[0]!._id.toString(),
        teacherId: teachers[0]!._id.toString(),
        comments: 'Excellent analysis of technology\'s impact on education. Your discussion of both benefits and challenges shows strong critical thinking. The examples you provided are well-chosen and relevant. Minor improvements needed in citation formatting.',
        aiSuggestedFeedback: 'This essay demonstrates excellent analytical skills and balanced perspective. The author effectively addresses both opportunities and challenges of technology integration.',
        grammarScore: 95,
        clarityScore: 92
      },
      {
        submissionId: submissions[1]!._id.toString(),
        teacherId: teachers[0]!._id.toString(),
        comments: 'Good understanding of the topic with solid research. Your points about equity and access are particularly well-developed. Consider expanding on specific technological solutions in the conclusion.',
        aiSuggestedFeedback: 'Strong essay with good structure and argumentation. The author shows awareness of complex issues in educational technology adoption.',
        grammarScore: 88,
        clarityScore: 90
      },
      {
        submissionId: submissions[3]!._id.toString(),
        teacherId: teachers[2]!._id.toString(),
        comments: 'Impressive implementation of the Stack class with proper TypeScript typing. Code is clean and well-documented. Good understanding of data structure principles. Consider adding more comprehensive error handling for edge cases.',
        aiSuggestedFeedback: 'Excellent code quality with proper TypeScript implementation. The documentation is clear and the time complexity analysis is accurate.',
        grammarScore: 100,
        clarityScore: 95
      }
    ]);

    console.log(`✅ Created ${feedbacks.length} feedback entries`);

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length} (${teachers.length} teachers, ${students.length} students)`);
    console.log(`   📝 Assignments: ${assignments.length}`);
    console.log(`   📊 Rubrics: ${rubrics.length}`);
    console.log(`   📤 Submissions: ${submissions.length}`);
    console.log(`   💬 Feedback: ${feedbacks.length}`);

    console.log('\n🔗 Reference integrity maintained across all collections');
    console.log('🚀 Ready for development and testing!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seed script
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
