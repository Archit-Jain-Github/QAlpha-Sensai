# ref: https://python.useinstructor.com/concepts/partial/#understanding-partial-responses
import instructor
from openai import OpenAI
from pydantic import BaseModel
from typing import List
from rich.console import Console
from dotenv import load_dotenv

load_dotenv()

client = instructor.from_openai(OpenAI())

text_block = """
In our recent online meeting, participants from various backgrounds joined to discuss the upcoming tech conference. The names and contact details of the participants were as follows:

- Name: John Doe, Email: johndoe@email.com, Twitter: @TechGuru44
- Name: Jane Smith, Email: janesmith@email.com, Twitter: @DigitalDiva88
- Name: Alex Johnson, Email: alexj@email.com, Twitter: @CodeMaster2023

During the meeting, we agreed on several key points. The conference will be held on March 15th, 2024, at the Grand Tech Arena located at 4521 Innovation Drive. Dr. Emily Johnson, a renowned AI researcher, will be our keynote speaker.

The budget for the event is set at $50,000, covering venue costs, speaker fees, and promotional activities. Each participant is expected to contribute an article to the conference blog by February 20th.

A follow-up meetingis scheduled for January 25th at 3 PM GMT to finalize the agenda and confirm the list of speakers.
"""


class User(BaseModel):
    name: str
    email: str
    twitter: str


class MeetingInfo(BaseModel):
    users: List[User]
    date: str
    location: str
    budget: int
    deadline: str


extraction_stream = client.chat.completions.create_partial(
    model="gpt-4o-2024-08-06",
    response_model=MeetingInfo,
    messages=[
        {
            "role": "user",
            "content": f"Get the information about the meeting and the users {text_block}",
        },
    ],
    stream=True,
)


console = Console()

for extraction in extraction_stream:
    obj = extraction.model_dump()
    console.clear()
    console.print(obj)

print(extraction.model_dump_json(indent=2))
"""
{
  "users": [
    {
      "name": "John Doe",
      "email": "johndoe@email.com",
      "twitter": "@TechGuru44"
    },
    {
      "name": "Jane Smith",
      "email": "janesmith@email.com",
      "twitter": "@DigitalDiva88"
    },
    {
      "name": "Alex Johnson",
      "email": "alexj@email.com",
      "twitter": "@CodeMaster2023"
    }
  ],
  "date": "2024-03-15",
  "location": "Grand Tech Arena located at 4521 Innovation Drive",
  "budget": 50000,
  "deadline": "2024-02-20"
}
"""