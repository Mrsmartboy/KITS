import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CodePracticePlayGround = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock fetching question data (replace with actual API call if available)
  useEffect(() => {
    const fetchQuestion = async () => {
      setLoading(true);
      try {
        // Mock data based on previous get-cpquestions response
        const mockQuestion = {
          Question: 'Create & Print List',
          Description:
            "Write a program to print a list with the given elements 'Rose', 183, 148, 123.64, False. The output should be a single line containing the list with the above elements.",
          Sample_Input: "['Rose', 183, 148, 123.64, False]",
          Sample_Output: "['Rose', 183, 148, 123.64, False]",
          status: 'SOLVED', // Mocked status
        };
        setQuestion(mockQuestion);
      } catch (error) {
        console.error('Failed to fetch question:', error);
        setError('Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  // Placeholder for code editor content (extended to test scrolling)
  const mockCode = `
# Sample code to demonstrate scrolling
list_a = ['Rose', 183, 148, 123.64, False]
print(list_a)
# More lines to test scrolling
print("Line 1")
print("Line 2")
print("Line 3")
print("Line 4")
print("Line 5")
print("Line 6")
print("Line 7")
print("Line 8")
print("Line 9")
print("Line 10")
print("Line 11")
print("Line 12")
print("Line 13")
print("Line 14")
print("Line 15")
print("Line 16")
print("Line 17")
print("Line 18")
print("Line 19")
print("Line 20")
  `;

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-gray-100">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section: Question Details */}
        <div className="w-1/2 bg-white p-6 overflow-y-auto border-r border-gray-200">
          {loading && <p className="text-gray-600">Loading question...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {question && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-800">{question.Question}</h1>
                  <span
                    className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                      question.status === 'SOLVED'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {question.status}
                  </span>
                </div>
                <button className="text-blue-500 hover:underline flex items-center">
                  Help{' '}
                  <span role="img" aria-label="bulb" className="ml-1">
                    💡
                  </span>
                </button>
              </div>
              <p className="text-gray-600 mb-4">{question.Description}</p>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Your code should print the following output:</h3>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-gray-800">{question.Sample_Output}</pre>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Sample Input</h3>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-gray-800">{question.Sample_Input}</pre>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Sample Output</h3>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-gray-800">{question.Sample_Output}</pre>
              </div>
              {/* Extended content to test scrolling */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Additional Instructions</h3>
                <p className="text-gray-600">
                  Ensure your code handles edge cases. For example, what happens if the list is empty? What if the elements are of different types? Make sure your output matches the expected format exactly, including brackets and spacing.
                </p>
                <p className="text-gray-600 mt-2">
                  Here's another example to consider:
                </p>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-gray-800">[1, 2, 3, 4, 5]</pre>
                <p className="text-gray-600 mt-2">
                  And another one:
                </p>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-gray-800">['a', 'b', 'c']</pre>
                <p className="text-gray-600 mt-2">
                  Keep adding more content to test the scrolling behavior. This paragraph is just to extend the content further. You can add more examples, constraints, or tips for solving the problem here.
                </p>
              </div>
              <button className="text-blue-500 hover:underline">Submit Feedback</button>
            </>
          )}
        </div>

        {/* Right Section: Code Editor (Placeholder) */}
        <div className="w-1/2 bg-gray-900 text-white p-6 overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap">{mockCode}</pre>
        </div>
      </div>

      {/* Footer: Buttons */}
      <div className="bg-white p-4 border-t border-gray-200 flex justify-between items-center">
        <button className="text-blue-500 hover:underline">Custom Input</button>
        <div className="space-x-3">
          <button className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600">
            Debug
          </button>
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Run Code
          </button>
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodePracticePlayGround;