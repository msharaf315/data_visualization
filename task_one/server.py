# %%
import numpy as np 
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

# %%
df = pd.read_csv("minors_causes_of_death.csv")
df = df.drop(['Unnamed: 0', 'code', 'Detailed List Numbers'], axis='columns')
death_count_columns= ['death_range_0_year', 'death_range_1_year',
       'death_range_2_year', 'death_range_3_year', 'death_range_4_year',
       'death_range_5_9', 'death_range_10_14', 'death_range_15_19']
df.columns 

# %%
def _get_line_chart_data(df):

    grouped_df = df.groupby(['year', 'Cause'], as_index=False).sum()
    grouped_df["total_death"] = grouped_df[death_count_columns].sum(axis=1)
    grouped_df[death_count_columns]
    grouped_df = grouped_df.drop(death_count_columns, axis='columns')
    grouped_df = grouped_df.drop(["country"], axis="columns")
    grouped_df["total_death"] = pd.Series(grouped_df["total_death"], dtype="Int64")
    grouped_df["year"] = pd.Series(grouped_df["year"], dtype="Int64")
    print(grouped_df.dtypes)
    return grouped_df.to_dict(orient="records")

def _filter_df(df, sex, country, year, cause):
    if country:
        df = df[df['country'] == country]
    if sex:
        df = df[df['sex'] == sex]
    if cause:
        df = df[df['Cause'] == cause]
    if year:
        df = df[df['year'] == year]

    return df 

def get_data(df, sex=None, country=None, year=None, cause=None):
    df = _filter_df(df, sex, country, year, cause)
    line_chart_data = _get_line_chart_data(df)
    return {"line_chart_data": line_chart_data}

# %%
from typing import Union

from fastapi import FastAPI
origins = [
    "http://127.0.0.1:5500",
]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def read_root(
    sex: Union[str, None] = None,
    country: Union[str, None] = None,
    year: Union[str, None] = None,
    cause: Union[str, None] = None,
):
    # print(get_data(df, sex, country, year, cause))
    return get_data(df, sex, country, year, cause)
