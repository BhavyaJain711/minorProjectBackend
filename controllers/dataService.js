// src/services/dataService.js
import axios from 'axios';

const payloadCMSBaseURL = 'http://localhost:3000/api'; // Replace with your Payload CMS URL

// Fetch exam component, student, and subject data
export async function fetchExamComponentData(examComponentId,token) {
  try {
    const examComponentResponse = await axios.get(`${payloadCMSBaseURL}/examComponents/${examComponentId}`,
        {
            headers: {
                Authorization: token
            }
        }
    );
    const examComponentData = examComponentResponse.data;

    // Fetch related subject and student data
    const subjectId = examComponentData.subject[0].id;
    const subjectResponse = await axios.get(`${payloadCMSBaseURL}/subjects/${subjectId}`,
        {
            headers: {
                Authorization: token
            }
        }
    );
    const studentsResponse = await axios.get(`${payloadCMSBaseURL}/users?role=student,`, {
      params: { subjectId }, // Adjust this query to filter students as needed
        headers: {
            Authorization: token
        }

    });

    return {
      examComponent: examComponentData,
      subject: subjectResponse.data,
      students: studentsResponse.data.docs
    };
  } catch (error) {
    console.error('Error fetching data from Payload CMS:',error);
    throw new Error('Failed to fetch data from Payload CMS');
  }
}

// Fetch students for a specific subject
export async function fetchSubjectStudents(subjectId, token) {
    try {
        // First, get all subject-student relationships for this subject
        const subjectStudentsResponse = await axios.get(`${payloadCMSBaseURL}/subjectstudents`, {
            params: {
                where: {
                    subject: {
                        equals: subjectId
                    }
                },
                depth: 1 // Include the related student data
            },
            headers: {
                Authorization: token
            }
        });

        // Extract student IDs from the relationships
        const studentIds = subjectStudentsResponse.data.docs.map(rel => rel.student.id);

        // Fetch detailed student information
        const studentsResponse = await axios.get(`${payloadCMSBaseURL}/users`, {
            params: {
                where: {
                    id: {
                        in: studentIds
                    }
                }
            },
            headers: {
                Authorization: token
            }
        });

        return {
            success: true,
            data: studentsResponse.data.docs
        };
    } catch (error) {
        console.error('Error fetching subject students:', error);
        throw new Error('Failed to fetch subject students');
    }
}

// Fetch a single student's details
export async function fetchStudentDetails(studentId, token) {
    try {
        const response = await axios.get(`${payloadCMSBaseURL}/students/${studentId}`, {
            headers: {
                Authorization: token
            }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error fetching student details:', error);
        throw new Error('Failed to fetch student details');
    }
}
