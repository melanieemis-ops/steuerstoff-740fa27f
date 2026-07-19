import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "Du bist ein Code-Generator."},
        {"role": "user", "content": "Generiere Code für [deine Anforderung]"}
    ]
)

# Code speichern und committen
generated_code = response['choices'][0]['message']['content']
with open("generated_file.py", "w") as f:
    f.write(generated_code)
