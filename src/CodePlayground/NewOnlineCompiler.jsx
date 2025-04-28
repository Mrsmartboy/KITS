import React from 'react';
import { FaArrowLeft, FaPython, FaChevronDown, FaBug } from "react-icons/fa";
import Editor from "@monaco-editor/react";

const NewOnlineCompiler = () => {
    return (
        <div className="min-h-screen flex flex-col font-[Inter] bg-[#1E1E1E]">
            {/* Main Compiler Container */}
            <div className="flex-1 m-4 md:m-6 p-4 md:p-6 border-2 border-gray-700 rounded-lg flex flex-col">
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
                    
                    {/* Left Side - Question Panel */}
                    <div className="flex flex-col gap-6 bg-gray-800 p-4 rounded-md h-full overflow-auto">

                        {/* Code Practice Button */}
                        <div className="flex items-center gap-2 px-4 py-2 border-2 border-[#6E6E6E] bg-[#1E1E1E] rounded-lg w-fit">
                            <FaArrowLeft className="text-white w-4 h-4" />
                            <div className="text-white text-base font-medium">Code Practice</div>
                        </div>

                        {/* Question Box */}
                        <div className="flex-1 bg-[#1E1E1E] border border-[rgba(216,216,216,0.8)] rounded-lg overflow-auto">
                            <div className="flex flex-col gap-4 p-6 text-white text-base font-medium leading-5">
                                <div>Question 1</div>
                                <div>
                                    <div>Question:</div>
                                    <div>Write a program to print addition of two numbers.</div>
                                </div>
                                <div>
                                    <div>Constraints:</div>
                                    <div>1 ≤ a, b ≤ 1000</div>
                                </div>
                                <div>
                                    <div>Difficulty:</div>
                                    <div>Easy</div>
                                </div>
                                <div>Sample Input:</div>
                                <div className="bg-[#525252] rounded-lg h-[70px] p-4 flex items-center">3 4</div>
                                <div>Sample Output:</div>
                                <div className="bg-[#525252] rounded-lg h-[52px] p-4 flex items-center">7</div>
                            </div>
                        </div>

                    </div>

                    {/* Right Side - Editor Panel */}
                    <div className="flex flex-col gap-6 bg-gray-800 p-4 rounded-md h-full overflow-auto">

                        {/* Top Bar */}
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            {/* Language Selector */}
                            <div className="flex items-center gap-3 px-3 py-2 border-2 border-[#BABABA] bg-[#1E1E1E] rounded-md w-fit">
                                <FaPython className="text-[#129E00] w-6 h-7" />
                                <div className="text-white text-base font-medium">Python 3.9</div>
                                <FaChevronDown className="text-white w-5 h-5" />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                               
                                <button className="px-7 py-2 border-2 border-[#BABABA] bg-[#1E1E1E] text-white rounded-md font-medium">
                                    Run
                                </button>
                              
                                <button className="px-4 py-2 border-2 border-[#BABABA] bg-[#129E00] text-white rounded-md font-medium">
                                    Submit
                                </button>
                            </div>
                        </div>

                        {/* Editor + Output Section */}
                        <div className="flex flex-col flex-1 gap-6 overflow-hidden">

                            {/* Code Editor */}
                            <div className="flex flex-col flex-[7] bg-[#1E1E1E] border border-[rgba(216,216,216,0.8)] rounded-lg overflow-hidden">
                                <div className="bg-[#525252] rounded-t-lg flex items-center h-9 px-4">
                                    <div className="text-white text-base font-medium">1</div>
                                </div>
                                <Editor
                                    height="100%"
                                    defaultLanguage="python"
                                    defaultValue="# Write your code here"
                                    theme="vs-dark"
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 16,
                                        lineNumbers: "on",
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            </div>

                            {/* Output Section */}
                            <div className="flex flex-col flex-[3] bg-[#1E1E1E] border border-[rgba(216,216,216,0.8)] rounded-lg p-4 gap-4 overflow-hidden">
                                {/* Case Tabs */}
                                <div className="flex gap-3 flex-wrap">
                                    <div className="px-5 py-2 bg-[#656565] rounded-lg text-white font-medium">Case 1</div>
                                    <div className="px-5 py-2 bg-[#3A3A3A] rounded-lg text-white font-medium">Case 2</div>
                                    <div className="px-5 py-2 bg-[#3A3A3A] rounded-lg text-white font-medium">Case 3</div>
                                </div>
                                {/* Output Console */}
                                <div className="flex-1 bg-[#1E1E1E] border border-[#3A3A3A] rounded-lg p-4 text-white overflow-auto">
                                    Output will be displayed here...
                                </div>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default NewOnlineCompiler;
