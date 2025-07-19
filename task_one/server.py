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

    grouped_df = df.groupby(["year"], as_index=False).sum()
    grouped_df["total_death"] = grouped_df[death_count_columns].sum(axis=1)
    grouped_df = grouped_df.drop(death_count_columns, axis='columns')
    grouped_df = grouped_df.drop(["country", "Cause", "sex"], axis="columns")
    grouped_df["total_death"] = pd.Series(grouped_df["total_death"], dtype="Int64")
    grouped_df["year"] = pd.Series(grouped_df["year"], dtype="Int64")
    print(grouped_df.dtypes)
    return grouped_df.to_dict(orient="records")


def _get_pie_chart_data(df):
    grouped = df.groupby("Cause", as_index=False)[death_count_columns].sum()
    grouped["total_death"] = grouped[death_count_columns].sum(axis=1)
    total = grouped["total_death"].sum()
    grouped["percentage"] = grouped["total_death"] / total * 100
    return grouped[["Cause", "total_death", "percentage"]].to_dict(orient="records")


def _get_map_chart_data(df):
    pass


# %%
def _get_pictorial_chart_data(df):
    result_df = pd.DataFrame(columns=["cause", "percent", "icon_count", "category"])
    df = df.groupby("Cause", as_index=False)[death_count_columns].sum()
    df = df[df["Cause"] != "Other"]
    df = df[df["Cause"] != "All causes"]
    for death_count_column in death_count_columns:
        df[death_count_column + "_percent"] = (
            df[death_count_column] / df[death_count_column].sum() * 100
        ).round(2)
        df[death_count_column + "icon_count"] = (
            df[death_count_column + "_percent"] / 100
        ).round(1) * 10
        temp_df = (
            df[
                [
                    "Cause",
                    death_count_column + "_percent",
                    death_count_column + "icon_count",
                ]
            ]
            .sort_values(by=death_count_column + "_percent", ascending=False)
            .head(10)
        )
        temp_df["category"] = death_count_column
        temp_df = temp_df.rename(
            columns={
                "Cause": "cause",
                death_count_column + "_percent": "percent",
                death_count_column + "icon_count": "icon_count",
            }
        )
        result_df = pd.concat([result_df, temp_df])
    return result_df.to_dict(orient="records")


# TODO remove
_get_pictorial_chart_data(df)

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
        df = df[df["country"] == sex]
    if year:
        df = df[df["year"] == year]
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
    # print(get_data(df, sex, country, year, cause))
    return get_data(df, sex, country, year, cause)

# %%
# TODO remove
x = _get_pictorial_chart_data(df)


# %%
