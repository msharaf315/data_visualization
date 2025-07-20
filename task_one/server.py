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
df.dtypes

# %%
def _get_line_chart_data(df):

    grouped_df = df.groupby(["year"], as_index=False).sum()
    grouped_df["total_death"] = grouped_df[death_count_columns].sum(axis=1)
    grouped_df = grouped_df.drop(death_count_columns, axis='columns')
    grouped_df = grouped_df.drop(["country", "Cause", "sex"], axis="columns")
    grouped_df["total_death"] = pd.Series(grouped_df["total_death"], dtype="Int64")
    grouped_df["year"] = pd.Series(grouped_df["year"], dtype="Int64")
    return grouped_df.to_dict(orient="records")


def _get_pie_chart_data(df):
    grouped = df.groupby("Cause", as_index=False)[death_count_columns].sum()
    grouped["total_death"] = grouped[death_count_columns].sum(axis=1)
    total = grouped["total_death"].sum()
    grouped["percentage"] = grouped["total_death"] / total * 100
    return grouped[["Cause", "total_death", "percentage"]].to_dict(orient="records")


def _get_map_chart_data(df):
    pass


def _get_pictorial_chart_data(df):
    pass


# %%
def _filter_df(
    df,
    country,
    year,
    cause,
    sex,
):

    if country:
        df = df[df["country"] == country]

    if sex:
        # Convert sex to int
        sex_value = int(sex)
        print(sex_value)
        df = df[df["sex"] == sex_value]

    if year:
        df = df[df["year"] == int(year)]
    if cause:
        df = df[df["Cause"] == cause]

    return df 


def get_data(df, country=None, sex=None, year=None, cause=None):
    df = _filter_df(df, country, year, cause, sex)
    line_chart_data = _get_line_chart_data(df)
    pie_chart_data = _get_pie_chart_data(df)
    map_chart_data = _get_map_chart_data(df)
    pictorial_chart_data = _get_pictorial_chart_data(df)

    return {
        "line_chart_data": line_chart_data,
        "map_chart_data": map_chart_data,
        "pie_chart_data": pie_chart_data,
        "pictorial_chart_data": pictorial_chart_data,
    }


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
    country: Union[str, None] = None,
    year: Union[str, None] = None,
    cause: Union[str, None] = None,
    sex: Union[str, None] = None,
):

    result = get_data(df, country, sex, year, cause)

    return result
