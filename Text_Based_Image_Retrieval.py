import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
import openai
import os
import time
import numpy as np
import streamlit as st
import ast

hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

images_df = pd.read_csv('test_images.csv')
openai.api_key = "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"

st.image("aiproff_logo.jpg", width=120, use_column_width=False)
st.header('Text Based Image Retrieval')

@st.cache_data(show_spinner=False)
def convert_to_float(lst):
    return [float(i) for i in ast.literal_eval(lst)]
  
images_df['caption_embedding'] = images_df['caption_embedding'].apply(convert_to_float)

@st.cache_data(show_spinner=False)
def get_embedding(text):
    result = openai.Embedding.create(model='text-embedding-ada-002',input=text)
    time.sleep(1.1)
    
    return result["data"][0]["embedding"]

def vector_similarity(vec1,vec2):
    return np.dot(np.array(vec1), np.array(vec2))

@st.cache_data(show_spinner=False)
def search_image(images_df, user_input, n=5):
    user_input_embedding = get_embedding(user_input)
    images_df['similarities'] = images_df.caption_embedding.apply(lambda vector: vector_similarity(vector, user_input_embedding))
    
    res = images_df.nlargest(n,'similarities')
    return res

@st.cache_data(show_spinner=False)
def image_retrieval(user_input = 'None'):
    result = search_image(images_df, user_input)
    image_paths = result['imagePath'].values.tolist()

    return image_paths
        
with st.form('Text Based Image Retrieval'):

    user_input = str(st.text_input('Enter the search keyword'))
    submitted = st.form_submit_button("Click to get the top 5 images back!")

    try:
        if submitted:
            images = []
            with st.spinner('Getting the images, please wait patiently...'):
                image_paths = image_retrieval(user_input=user_input)

                for image_path in image_paths:
                    image = Image.open(image_path)
                    images.append(image)

            st.image(images)

    except:
        st.error('Please refresh the web page in case of any issues.')
