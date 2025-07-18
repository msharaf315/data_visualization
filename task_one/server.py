# %%
import numpy as np 
import pandas as pd

# %%
df = pd.read_csv("minors_causes_of_death.csv")
df = df.drop(['Unnamed: 0', 'code', 'Detailed List Numbers'], axis='columns')
death_count_columns= ['death_range_0_year', 'death_range_1_year',
       'death_range_2_year', 'death_range_3_year', 'death_range_4_year',
       'death_range_5_9', 'death_range_10_14', 'death_range_15_19']
df.columns 

# %%
def _get_line_chart_data(df):
    # Group by year, country, and Cause
    grouped_df = df.groupby(['year', 'country', 'Cause'], as_index=False).sum()
    grouped_df["total_death"] = grouped_df[death_count_columns].sum(axis=1)
    grouped_df = grouped_df.drop(death_count_columns, axis='columns')
    return grouped_df

def _filter_df(df, country):
    if country:
        df = df[df['country'] == country]
    return df 

def get_data(df, country=None):
    df = _filter_df(df, country)
    line_chart_data = _get_line_chart_data(df)
   
    response = {"line_chart_data": line_chart_data.to_dict(orient="records")}
    print(response)
    return response
get_data(df)

# %%
from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://127.0.0.1:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root(
    country: Union[str, None] = None,
):
    """Root endpoint to get data based on country filter only."""
    return get_data(df, country)

def get_pie_chart_data(df, country=None):
    if country:
        df = df[df['country'] == country]
    grouped = df.groupby('Cause', as_index=False)[death_count_columns].sum()
    grouped['total_death'] = grouped[death_count_columns].sum(axis=1)
    total = grouped['total_death'].sum()
    grouped['percentage'] = grouped['total_death'] / total * 100
    return grouped[['Cause', 'total_death', 'percentage']].to_dict(orient='records')

@app.get("/pie")
def pie_chart_endpoint(
    country: Union[str, None] = None,
):
    return {"pie_chart_data": get_pie_chart_data(df, country)}
