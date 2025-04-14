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
