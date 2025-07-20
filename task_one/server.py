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


# %%
def _get_cat_name_from_column_name(col_name):
    if col_name == "death_range_0_year":
        return "Less than a year old"
    elif col_name == "death_range_1_year":
        return "One year old"
    elif col_name == "death_range_2_year":
        return "Two years old"
    elif col_name == "death_range_3_year":
        return "Three years old"
    elif col_name == "death_range_4_year":
        return "Four years old"
    elif col_name == "death_range_5_9":
        return "Between 5 and 9 years old"
    elif col_name == "death_range_10_14":
        return "Between 10 and 14 years old"
    elif col_name == "death_range_15_19":
        return "Between 15 and 19 years old"

# %%
def _get_pictorial_chart_data(df):
    result_df = pd.DataFrame(
        columns=["cause", "percent", "icon_count", "category", "x_location"]
    )
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
        temp_df["category"] = _get_cat_name_from_column_name(death_count_column)
        temp_df = temp_df.rename(
            columns={
                "Cause": "cause",
                death_count_column + "_percent": "percent",
                death_count_column + "icon_count": "icon_count",
            }
        )
        # Handle x-axis location
        counter = 1
        total_perecnt = 0
        for _, row in temp_df.iterrows():
            if row["icon_count"] != 0:
                total_perecnt += row["percent"]
            for _ in range(int(row["icon_count"])):
                row["x_location"] = counter
                counter += 1
                result_df = pd.concat([result_df, row.to_frame().T])

        #  Pad "other" data points
        for i in range(counter, 11):
            # columns=["cause", "percent", "icon_count", "category", "x_location"]
            empty_series = pd.Series(dtype=float)
            empty_series["cause"] = "Other"
            empty_series["percent"] = round(100 - total_perecnt, 2)
            empty_series["icon_count"] = 0
            empty_series["category"] = _get_cat_name_from_column_name(
                death_count_column
            )
            empty_series["x_location"] = counter
            counter += 1
            result_df = pd.concat([result_df, empty_series.to_frame().T])

    return result_df.to_dict(orient="records")


# %%
def _filter_df(
    df,
    country,
    year,
    cause,
    sex,
    year_from=None,
    year_to=None,
):
    

    if country:
        df = df[df["country"] == country]
        

    if sex:
        
        sex_value = int(sex)
        df = df[df["sex"] == sex_value]
        
    if year:
        df = df[df["year"] == int(year)]
        
    
    # year range (if single year is not specified)
    elif year_from and year_to:
        year_from_int = int(year_from)
        year_to_int = int(year_to)
        df = df[(df["year"] >= year_from_int) & (df["year"] <= year_to_int)]
    elif year_from:
        year_from_int = int(year_from)
        df = df[df["year"] >= year_from_int]
    elif year_to:
        year_to_int = int(year_to)
        df = df[df["year"] <= year_to_int]
        
    if cause:
        df = df[df["Cause"] == cause]

    return df 


def get_data(df, country=None, sex=None, year=None, cause=None, year_from=None, year_to=None):
    df = _filter_df(df, country, year, cause, sex, year_from, year_to)
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
    year_from: Union[str, None] = None,
    year_to: Union[str, None] = None,
):
    result = get_data(df, country, sex, year, cause, year_from, year_to)
    return result
