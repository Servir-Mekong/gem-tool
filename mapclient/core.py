"""Helper Functions for the Controllers Module"""
import os
import requests
from django.http import HttpResponse
from datetime import datetime, timedelta
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from django.conf import settings
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
import json

def get_gii(level, area_id, country_id, year):
    try:
        area_list = ""
        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:

            mainSqlCountry = "select  g.id, g.admin_level, g.year, g.gii, adm0.name_0 as country_name, adm0.name_0 as area_name, adm0.area_id, st_AsGeoJSON(adm0.geom, 3) from gii_gender_indices_table as g inner join adm0 on adm0.area_id = g.area_id "
            mainSqlProvince = "select g.id, g.admin_level, g.year, g.gii, adm0.name_0 as country_name, adm1.name_1 as area_name, adm1.area_id, st_AsGeoJSON(adm1.geom, 3) from gii_gender_indices_table as g inner join adm1 on adm1.area_id = g.area_id inner join adm0 on adm0.area_id = adm1.id_0 "
            
            if level=='country' and area_id == '9999' and country_id == '9999':
                sql = mainSqlCountry + "where g.admin_level='country' and g.year="+year+";"

            elif level=='country' and area_id != '9999':
                sql = mainSqlCountry + "where g.admin_level='country' and g.area_id::text in ("+area_id+") and g.year="+year+";"

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainSqlCountry + "where g.admin_level='country' and adm0.id_0::text='"+ country_id+"' and g.year="+year+";"

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainSqlCountry + "where g.admin_level='country' and g.year="+year+";"

            elif level=='province' and area_id == '9999' and country_id =='9999':
                sql =  mainSqlProvince + "where g.admin_level='province' and g.year="+year+";"

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainSqlProvince + "where g.admin_level='province' and g.year="+year+";"

            elif level=='province' and area_id != '9999' and country_id =='':

                sql = mainSqlProvince + "where g.admin_level='province' and g.area_id::text in ("+area_id+") and g.year="+year+";"

            elif level=='province' and area_id == '9999' and country_id !='':
                sql = mainSqlProvince + "where g.admin_level='province'  and adm1.id_0::text='"+ country_id+"'  and g.year="+year+";"

            elif level=='province' and area_id != '9999':
                sql = mainSqlProvince + "where g.admin_level='province' and g.area_id::text in ("+area_id+") and g.year="+year+";"

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                feature_prop = {
                "id": row[0],
                "admin_level" : row[1],
                "year" : row[2],
                "gii" : round(row[3],2),
                "country_name": row[4],
                "area_name": row[5],
                "area_id": row[6]
                }

                feature = {
                "type": "Feature",
                "name": row[5],
                "id": row[0],
                "properties": feature_prop,
                "geometry": json.loads(row[7])
                }


                features[0]["features"].append(feature)

        return features


    except Exception as e:
        return e

def get_line_chart_data(level, area_id, country_id, start_year, end_year):
    try:
        items=[]
        with connection.cursor() as cursor:

            mainSqlCountry = "select  gii.id, gii.admin_level, gii.year, gii.gii, adm0.name_0 as country_name, adm0.name_0 as area_name, adm0.area_id from gii_gender_indices_table as gii inner join adm0 on adm0.area_id = gii.area_id "
            mainSqlProvince = "select  gii.id, gii.admin_level, gii.year, gii.gii, adm0.name_0 as country_name, adm1.name_1 as area_name, adm1.area_id from gii_gender_indices_table as gii inner join adm1 on adm1.area_id = gii.area_id inner join adm0 on adm0.area_id = adm1.id_0  "
            if level=='country' and area_id == '9999' and country_id == '9999':
                sql = mainSqlCountry + "where gii.admin_level='country' order by gii.area_id, gii.year;"

            elif level=='country' and area_id != '9999':
                sql = mainSqlCountry + "where gii.admin_level='country' and gii.area_id::text in ("+area_id+") and gii.year between "+start_year+" and "+end_year+" order by gii.area_id, gii.year;"

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainSqlCountry + "where gii.admin_level='country' and adm0.id_0='"+ country_id+"' and gii.year between "+start_year+" and "+end_year+" order by gii.area_id, gii.year;"

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainSqlCountry + "where gii.admin_level='country' and gii.year between "+start_year+" and "+end_year+" order by gii.area_id, gii.year;"

            elif level=='province' and area_id == '9999' and country_id =='9999':
                sql =  mainSqlProvince + "where gii.admin_level='province' and gii.year between "+start_year+" and "+end_year+" order by gii.area_id, gii.year;"

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainSqlProvince + "where gii.admin_level='province' and gii.year between "+start_year+" and "+end_year+" order by gii.area_id, gii.year;"

            elif level=='province' and area_id == '9999' and country_id !='':
                sql = mainSqlProvince + "where gii.admin_level='province' and adm1.id_0='"+ country_id+"' and gii.year between "+start_year+" and "+end_year+" order by gii.area_id, gii.year;"

            elif level=='province' and area_id != '9999':
                sql = mainSqlProvince + "where gii.admin_level='province' and gii.area_id::text in ("+area_id+") and gii.year between "+start_year+" and "+end_year+" order by gii.area_id, gii.year;"

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                feature_prop = {
                    "id": row[0],
                    "admin_level" : row[1],
                    "year" : row[2],
                    "gii" : round(row[3],2),
                    "country_name": row[4],
                    "area_name": row[5],
                    "area_id": row[6],
                }

                items.append(feature_prop)

        return items


    except Exception as e:
        return e

def download_gii(level, area_id, country_id, start_year, end_year):
    try:
        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:

            mainsql_country = "select gii.id, gii.admin_level, gii.year, gii.gii, adm0.name_0 as area_name, adm0.area_id, st_AsGeoJSON(adm0.geom, 3) from gii_gender_indices_table as gii inner join adm0 on adm0.area_id = gii.area_id where gii.admin_level='country' and gii.year between "+start_year+" and "+end_year+" "
            mainsql_province = "select  gii.id, gii.admin_level, gii.year, gii.gii, adm1.name_0, adm1.name_1, adm1.area_id, st_AsGeoJSON(adm1.geom, 3) from gii_gender_indices_table as gii inner join adm1 on adm1.area_id = gii.area_id where gii.admin_level='province' and gii.year between "+start_year+" and "+end_year+" "
            if level=='country' and area_id == '9999' and country_id == '9999':
                sql = mainsql_country

            elif level=='country' and area_id != '9999':
                sql = mainsql_country + " and gii.area_id::text in ("+area_id+") ;"

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainsql_country + " and adm0.id_0='"+ country_id+"' ;"

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainsql_country

            elif level=='province' and area_id == '9999' and country_id =='9999':
                sql = mainsql_province

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainsql_province

            elif level=='province' and area_id == '9999' and country_id !='':
                sql = mainsql_province + " and adm1.id_0='"+ country_id+"' ;"

            elif level=='province' and area_id != '9999':
                sql = mainsql_province +  " and gii.area_id::text in ("+area_id+")"


            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:

                if level == 'country':
                    feature_prop = {
                    "id": row[0],
                    "admin_level" : row[1],
                    "year" : row[2],
                    "gii" : round(row[3],2),
                    "name_0": row[4],
                    "area_id": row[5],

                    }

                    feature = {
                    "type": "Feature",
                    "name": row[4],
                    "id": row[0],
                    "properties": feature_prop,
                    "geometry": json.loads(row[6])
                    }
                else:
                    feature_prop = {
                    "id": row[0],
                    "admin_level" : row[1],
                    "year" : row[2],
                    "gii" : round(row[3],2),
                    "name_0": row[4],
                    "name_1": row[5],
                    "area_id": row[6],

                    }

                    feature = {
                    "type": "Feature",
                    "name": row[5],
                    "id": row[0],
                    "properties": feature_prop,
                    "geometry": json.loads(row[7])
                    }

                features[0]["features"].append(feature)

        return features


    except Exception as e:
        return e


def get_gii_dimension_group(area_id, level, year):
    try:
        items=[]
        with connection.cursor() as cursor:
            sql = """SELECT t3.common_id, t3.common_des FROM gii_dimension_data_table AS t1
            INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
            INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
            WHERE t1.area_id = """+area_id+"""  AND t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' GROUP BY t3.common_id, t3.common_des;"""

            cursor.execute(sql)
            data = cursor.fetchall()
            count =0
            for row in data:
                dimension_group = {
                "id": row[0],
                "desc": row[1],
                "no": count,
                }
                items.append(dimension_group)
                count+=1
        return items
    except Exception as e:
        return e

def get_gii_dimension_data(area_id, level, year):
    try:
        items=[]
        with connection.cursor() as cursor:
            sql = """SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t1.admin_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des
            FROM gii_dimension_data_table AS t1
            INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
            INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
            WHERE t1.area_id = """+area_id+""" AND t1.year = """+year+""" AND t1.admin_level = '"""+level+"""';"""

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                dimension_data = {
                "admin_level": row[0],
                "area_id": row[1],
                "year": row[2],
                "dimension_id": row[3],
                "value": round(row[4],2),
                "percent":row[4]*100,
                "admin_name": row[5],
                "dimension_desc": row[6],
                "data": row[7],
                "unit": row[8],
                "common_id": row[9],
                "common_des": row[10]
                }
                items.append(dimension_data)
        return items
    except Exception as e:
        return e

def get_gii_dimension_map(area_id, level, year, common_id, data, country_id):
    try:

        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:

            mainSqlCountry = """SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t4.name_0, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= '"""+data+"""' """
            mainSqlProvince = """SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t4.name_0, t4.name_1, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id  WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= '"""+data+"""' """

            if level=='country' and area_id == '9999' and country_id == '9999':
                sql = mainSqlCountry

            elif level=='country' and area_id != '9999':
                sql = mainSqlCountry + """ AND t1.area_id::text in ("""+area_id+""");"""

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainSqlCountry + """ AND t4.id_0= """+country_id+""";"""

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainSqlCountry

            elif level=='province' and area_id == '9999' and country_id == '9999':
                sql = mainSqlProvince

            elif level=='province' and area_id != '9999':
                sql = mainSqlProvince +  """ AND t1.area_id::text in ("""+area_id+""");"""

            elif level=='province' and area_id == '9999' and country_id !='':
                sql =  sql = mainSqlProvince +  """ AND t4.id_0= """+country_id+""";"""

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainSqlProvince

            cursor.execute(sql)
            data = cursor.fetchall()

            for row in data:
                if level=='country':
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "year": row[2],
                    "dimension_id": row[3],
                    "value": row[4],
                    "area_name": row[5],
                    "dimension_desc": row[6],
                    "data": row[7],
                    "unit": row[8],
                    "common_id": row[9],
                    "common_des": row[10]
                    }
                    feature = {
                    "type": "Feature",
                    "id": row[1],
                    "properties": feature_prop,
                    "geometry": json.loads(row[11])
                    }


                else:
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "year": row[2],
                    "dimension_id": row[3],
                    "value": row[4],
                    "area_name": row[5] + '/'+ row[6],
                    "dimension_desc": row[7],
                    "data": row[8],
                    "unit": row[9],
                    "common_id": row[10],
                    "common_des": row[11]
                    }

                    feature = {
                    "type": "Feature",
                    "id": row[1],
                    "properties": feature_prop,
                    "geometry": json.loads(row[12])
                    }


                features[0]["features"].append(feature)

        return features
    except Exception as e:
        return e

def get_dimension_line_chart_data(level, area_id, common_id, data,  country_id, start_year, end_year):
    try:
        items=[]
        with connection.cursor() as cursor:
            mainSqlCountry = """SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t4.name_0 as area_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id WHERE t1.year between """+start_year+""" and """+end_year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= '"""+data+"""' """
            mainSqlProvince = """SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t4.name_1 as area_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id  WHERE t1.year between """+start_year+""" and """+end_year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= '"""+data+"""' """

            if level=='country' and area_id == '9999' and country_id == '9999':
                sql = mainSqlCountry

            elif level=='country' and area_id != '9999':
                sql = mainSqlCountry + """ AND t1.area_id::text in ("""+area_id+""");"""

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainSqlCountry + """ AND t4.id_0= """+country_id+""";"""

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainSqlCountry

            elif level=='province' and area_id == '9999' and country_id == '9999':
                sql = mainSqlProvince

            elif level=='province' and area_id != '9999':
                sql = mainSqlProvince +  """ AND t1.area_id::text in ("""+area_id+""");"""

            elif level=='province' and area_id == '9999' and country_id !='':
                sql =  sql = mainSqlProvince +  """ AND t4.id_0= """+country_id+""";"""

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainSqlProvince


            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "year": row[2],
                    "dimension_id": row[3],
                    "value": row[4],
                    "area_name": row[5],
                    "dimension_desc": row[6],
                    "data": row[7],
                    "unit": row[8],
                    "common_id": row[9],
                    "common_des": row[10]
                }
                items.append(feature_prop)
        return items

    except Exception as e:
        return e



def get_gii_indicator_map(area_id, level, year, indicator_id, data, country_id):
    try:

        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:

            mainSqlCountry = """SELECT t1.id, t1.admin_level, t1.year, t1.value, t1.area_id, t1.indicator_id, t2.indicator_desc, t2.data, t2.unit, t4.name_0, st_AsGeoJSON(t4.geom, 3)
                FROM gii_indicator_data_table AS t1
                INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t1.indicator_id= '"""+indicator_id+"""' AND t2.data = '"""+data+"""' """
            mainSqlProvince = """SELECT t1.id, t1.admin_level, t1.year, t1.value, t1.area_id, t1.indicator_id, t2.indicator_desc, t2.data, t2.unit, t4.name_0, t4.name_1, st_AsGeoJSON(t4.geom, 3)
                FROM gii_indicator_data_table AS t1
                INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id  WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t1.indicator_id= '"""+indicator_id+"""' AND t2.data = '"""+data+"""' """

            if level=='country' and area_id == '9999' and country_id == '9999' :
                sql = mainSqlCountry

            elif level=='country' and area_id != '9999':
                sql = mainSqlCountry + """ AND t1.area_id::text in ("""+area_id+""");"""

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainSqlCountry + """ AND t4.id_0= """+country_id+""";"""

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainSqlCountry

            elif level=='province' and area_id == '9999' and country_id == '9999':
                sql = mainSqlProvince

            elif level=='province' and area_id != '9999':
                sql = mainSqlProvince + """ AND t1.area_id::text in ("""+area_id+""");"""

            elif level=='province' and area_id == '9999' and country_id !='':
                sql = mainSqlProvince + """ AND t4.id_0= """+country_id+""";"""

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainSqlProvince

            cursor.execute(sql)
            data = cursor.fetchall()

            for row in data:
                if level=='country':
                    feature_prop = {
                    "id": row[0],
                    "admin_level": row[1],
                    "year": row[2],
                    "value": row[3],
                    "area_id": row[4],
                    "indicator_id": row[5],
                    "indicator_desc": row[6],
                    "data": row[7],
                    "unit": row[8],
                    "area_name": row[9],
                    "name_0": row[9],
                    }

                    feature = {
                    "type": "Feature",
                    "name": row[9],
                    "id": row[4],
                    "properties": feature_prop,
                    "geometry": json.loads(row[10])
                    }
                else:
                    feature_prop = {
                    "id": row[0],
                    "admin_level": row[1],
                    "year": row[2],
                    "value": row[3],
                    "area_id": row[4],
                    "indicator_id": row[5],
                    "indicator_desc": row[6],
                    "data": row[7],
                    "unit": row[8],
                    "area_0": row[9],
                    "area_name": row[9] + '/'+row[10],
                    "name_1": row[10],
                    }

                    feature = {
                    "type": "Feature",
                    "name": row[9],
                    "id": row[4],
                    "properties": feature_prop,
                    "geometry": json.loads(row[11])
                    }


                features[0]["features"].append(feature)

        return features
    except Exception as e:
        return e



def download_gii_dimension(area_id, level, common_id, country_id, start_year, end_year):
    try:

        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:
            mainSqlCountry = """SELECT female.admin_level, female.area_id, female.name_0,  female.year, female.value as female,  male.value as male, male.common_id, male.common_des, male.st_asgeojson
                FROM (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t4.name_0, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'female' {}) AS female
				INNER JOIN (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t4.name_0, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'male' {}) AS male ON female.area_id = male.area_id AND female.year = male.year AND female.common_id = male.common_id;"""


            mainSqlProvince = """SELECT female.admin_level, female.area_id, female.name_0, female.name_1,  female.year, female.value as female,  male.value as male, male.common_id, male.common_des, male.st_asgeojson
                FROM (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t4.name_0, t4.name_1, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+"""  AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'female' {}) AS female
				INNER JOIN (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t4.name_0, t4.name_1, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+"""  AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'male' {}) AS male ON female.area_id = male.area_id AND female.year = male.year AND female.common_id = male.common_id; """

            if level=='country' and area_id == '9999' and country_id == '9999' :
                sql = mainSqlCountry.format(" ", " ")

            elif level=='country' and area_id != '9999':
                sql = mainSqlCountry.format(""" AND t1.area_id::text in ("""+area_id+""")""" , """ AND t1.area_id::text in ("""+area_id+""")""")

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainSqlCountry.format(""" AND t4.id_0= """+country_id+""" """ , """ AND t4.id_0= """+country_id+""" """)

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainSqlCountry.format(" ", " ")

            elif level=='province' and area_id == '9999' and country_id == '9999':
                sql = mainSqlProvince.format(" ", " ")

            elif level=='province' and area_id != '9999':
                sql = mainSqlProvince.format(""" AND t1.area_id::text in ("""+area_id+""")""" , """ AND t1.area_id::text in ("""+area_id+""")""")

            elif level=='province' and area_id == '9999' and country_id !='':

                sql = mainSqlProvince.format(""" AND t4.id_0= """+country_id+""" """ , """ AND t4.id_0= """+country_id+""" """)

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainSqlProvince.format(" ", " ")

            cursor.execute(sql)
            data = cursor.fetchall()

            for row in data:
                if level=='country':
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "name_0": row[2],
                    "year": row[3],
                    "female": row[4],
                    "male": row[5],
                    "common_id": row[6],
                    "common_des": row[7],
                    }

                    feature = {
                    "type": "Feature",
                    "name": row[2],
                    "id": row[1],
                    "properties": feature_prop,
                    "geometry": json.loads(row[8])
                    }
                else:
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "name_0": row[2],
                    "name_1": row[3],
                    "year": row[4],
                    "female": row[5],
                    "male": row[6],
                    "common_id": row[7],
                    "common_des": row[8],
                    }

                    feature = {
                    "type": "Feature",
                    "name": row[2],
                    "id": row[1],
                    "properties": feature_prop,
                    "geometry": json.loads(row[9])
                    }


                features[0]["features"].append(feature)

        return features
    except Exception as e:
        return e

# def download_gii_indicator(area_id, level, indicator_id, country_id, start_year, end_year):
#     try:

#         features=[]
#         features.append({
#                         "type": "FeatureCollection",
#                         "features": []
#                     })
#         with connection.cursor() as cursor:
#             mainSqlCountry = """SELECT female.admin_level, female.area_id, female.name_0, female.year, female.value as female,  male.value as male, female.common_id, female.common_des, female.indicator_id, female.indicator_desc, female.st_asgeojson
#                 FROM (SELECT t1.admin_level, t1.area_id, t1.year, t2.indicator_id, t1.value, t4.name_0, t2.indicator_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
#                 FROM gii_indicator_data_table AS t1
#                 LEFT JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
#                 LEFT JOIN gii_common_id_table AS t3 ON  t2.common_id = t3.common_id
#                 LEFT JOIN adm0 AS t4 ON t1.area_id = t4.area_id
#                 WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+""" AND t1.admin_level = '"""+level+"""' AND t2.indicator_id= '"""+indicator_id+"""' AND t2.data= 'female' {}) AS female
# 				LEFT JOIN (SELECT t1.admin_level, t1.area_id, t1.year, t2.indicator_id, t1.value, t4.name_0, t2.indicator_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
#                 FROM gii_indicator_data_table AS t1
#                 LEFT JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
#                 LEFT JOIN gii_common_id_table AS t3 ON  t2.common_id = t3.common_id
#                 LEFT JOIN adm0 AS t4 ON t1.area_id = t4.area_id
#                 WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+""" AND t1.admin_level = '"""+level+"""' AND t2.indicator_id= '"""+indicator_id+"""' AND t2.data= 'male' {}) AS male ON female.area_id = male.area_id AND female.year = male.year AND female.common_id = male.common_id;"""


#             mainSqlProvince = """SELECT female.admin_level, female.area_id, female.name_0, female.name_1, female.year, female.value as female,  male.value as male, female.common_id, female.common_des, female.indicator_id, female.indicator_desc, female.st_asgeojson
#                 FROM (SELECT t1.admin_level, t1.area_id, t1.year, t2.indicator_id, t1.value, t4.name_0, t4.name_1, t2.indicator_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
#                 FROM gii_indicator_data_table AS t1
#                 LEFT JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
#                 LEFT JOIN gii_common_id_table AS t3 ON  t2.common_id = t3.common_id
#                 LEFT JOIN adm1 AS t4 ON t1.area_id = t4.area_id
#                 WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+"""  AND t1.admin_level = '"""+level+"""' AND t2.indicator_id= '"""+indicator_id+"""' AND t2.data= 'female' {}) AS female
# 				LEFT JOIN (SELECT t1.admin_level, t1.area_id, t1.year, t2.indicator_id, t1.value, t4.name_0, t4.name_1, t2.indicator_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
#                 FROM gii_indicator_data_table AS t1
#                 LEFT JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
#                 LEFT JOIN gii_common_id_table AS t3 ON  t2.common_id = t3.common_id
#                 LEFT JOIN adm1 AS t4 ON t1.area_id = t4.area_id
#                 WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+"""  AND t1.admin_level = '"""+level+"""' AND t2.indicator_id= '"""+indicator_id+"""' AND t2.data= 'male' {}) AS male ON female.area_id = male.area_id AND female.year = male.year AND female.common_id = male.common_id; """

#             if level=='country' and area_id == '9999' and country_id == '9999' :
#                 sql = mainSqlCountry.format(" ", " ")

#             elif level=='country' and area_id != '9999':
#                 sql = mainSqlCountry.format(""" AND t1.area_id::text in ("""+area_id+""")""" , """ AND t1.area_id::text in ("""+area_id+""")""")

#             elif level=='country' and area_id == '9999' and country_id !='':
#                 sql = mainSqlCountry.format(""" AND t4.id_0= """+country_id+""" """ , """ AND t4.id_0= """+country_id+""" """)

#             elif level=='country' and area_id == '9999' and country_id =='':
#                 sql = mainSqlCountry.format(" ", " ")

#             elif level=='province' and area_id == '9999' and country_id == '9999':
#                 sql = mainSqlProvince.format(" ", " ")

#             elif level=='province' and area_id != '9999':
#                 sql = mainSqlProvince.format(""" AND t1.area_id::text in ("""+area_id+""")""" , """ AND t1.area_id::text in ("""+area_id+""")""")

#             elif level=='province' and area_id == '9999' and country_id !='':

#                 sql = mainSqlProvince.format(""" AND t4.id_0= """+country_id+""" """ , """ AND t4.id_0= """+country_id+""" """)

#             elif level=='province' and area_id == '9999' and country_id =='':
#                 sql = mainSqlProvince.format(" ", " ")

#             print(sql)
#             cursor.execute(sql)
#             data = cursor.fetchall()

#             for row in data:
#                 if level=='country':
#                     feature_prop = {
#                     "admin_level": row[0],
#                     "area_id": row[1],
#                     "name_0": row[2],
#                     "year": row[3],
#                     "female": row[4],
#                     "male": row[5],
#                     "common_id": row[6],
#                     "common_des": row[7],
#                     "indicator_id": row[8],
#                     "indicator_desc": row[9],
#                     }

#                     feature = {
#                     "type": "Feature",
#                     "name": row[2],
#                     "id": row[1],
#                     "properties": feature_prop,
#                     "geometry": json.loads(row[10])
#                     }
#                 else:
#                     feature_prop = {
#                     "admin_level": row[0],
#                     "area_id": row[1],
#                     "name_0": row[2],
#                     "name_1": row[3],
#                     "year": row[4],
#                     "female": row[5],
#                     "male": row[6],
#                     "common_id": row[7],
#                     "common_des": row[8],
#                     "indicator_id": row[9],
#                     "indicator_desc": row[10],
#                     }

#                     feature = {
#                     "type": "Feature",
#                     "name": row[2],
#                     "id": row[1],
#                     "properties": feature_prop,
#                     "geometry": json.loads(row[11])
#                     }


#                 features[0]["features"].append(feature)

#         return features
#     except Exception as e:
#         return e



def download_gii_indicator(area_id, level, indicator_id, country_id, start_year, end_year):
    try:

        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:
            mainSqlCountry = """SELECT t1.admin_level, t1.area_id, t1.year, t2.indicator_id, t1.value, t4.name_0, t2.indicator_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_indicator_data_table AS t1
                INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
                INNER JOIN gii_common_id_table AS t3 ON  t2.common_id = t3.common_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+""" AND t1.admin_level = '"""+level+"""' AND t1.indicator_id= '"""+indicator_id+"""' {}"""


            mainSqlProvince = """SELECT t1.admin_level, t1.area_id, t1.year, t2.indicator_id, t1.value, t4.name_0, t4.name_1, t2.indicator_desc, t2.data, t2.unit, t3.common_id, t3.common_des, st_AsGeoJSON(t4.geom, 3)
                FROM gii_indicator_data_table AS t1
                INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
                INNER JOIN gii_common_id_table AS t3 ON  t2.common_id = t3.common_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+"""  AND t1.admin_level = '"""+level+"""' AND t1.indicator_id= '"""+indicator_id+"""' {}"""

            if level=='country' and area_id == '9999' and country_id == '9999' :
                sql = mainSqlCountry.format(" ", " ")

            elif level=='country' and area_id != '9999':
                sql = mainSqlCountry.format(""" AND t1.area_id::text in ("""+area_id+""")""" , """ AND t1.area_id::text in ("""+area_id+""")""")

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainSqlCountry.format(""" AND t4.id_0= """+country_id+""" """ , """ AND t4.id_0= """+country_id+""" """)

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainSqlCountry.format(" ", " ")

            elif level=='province' and area_id == '9999' and country_id == '9999':
                sql = mainSqlProvince.format(" ", " ")

            elif level=='province' and area_id != '9999':
                sql = mainSqlProvince.format(""" AND t1.area_id::text in ("""+area_id+""")""" , """ AND t1.area_id::text in ("""+area_id+""")""")

            elif level=='province' and area_id == '9999' and country_id !='':

                sql = mainSqlProvince.format(""" AND t4.id_0= """+country_id+""" """ , """ AND t4.id_0= """+country_id+""" """)

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainSqlProvince.format(" ", " ")

            cursor.execute(sql)
            data = cursor.fetchall()

            for row in data:
                if level=='country':
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "year": row[2],
                    "indicator id": row[3],
                    "value": row[4],
                    "name_0": row[5],
                    "indicator_desc": row[6],
                    "data": row[7],
                    "unit": row[8],
                    "common_id": row[9],
                    "common_des": row[10],
                    }

                    feature = {
                    "type": "Feature",
                    "name": row[5],
                    "id": row[1],
                    "properties": feature_prop,
                    "geometry": json.loads(row[11])
                    }
                else:
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "year": row[2],
                    "indicator id": row[3],
                    "value": row[4],
                    "name_0": row[5],
                    "name_1": row[6],
                    "indicator_desc": row[7],
                    "data": row[8],
                    "unit": row[9],
                    "common_id": row[10],
                    "common_des": row[11],

                    }

                    feature = {
                    "type": "Feature",
                    "name": row[6],
                    "id": row[1],
                    "properties": feature_prop,
                    "geometry": json.loads(row[12])
                    }


                features[0]["features"].append(feature)

        return features
    except Exception as e:
        return e



def get_gii_indicator_group(area_id, level, year):
    try:
        items=[]
        with connection.cursor() as cursor:
            sql = """SELECT count(t2.id), t2.indicator_desc, t2.common_id
            FROM gii_indicator_data_table AS t1
            INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
            INNER JOIN gii_common_id_table AS t3 ON  t2.common_id = t3.common_id
            WHERE t1.area_id = """+area_id+""" AND t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' GROUP BY t2.indicator_desc, t2.common_id;"""

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                indicator_data = {
                "count" : row[0],
                "indicator" : row[1],
                "common_id" : row[2],
                }
                items.append(indicator_data)
        return items
    except Exception as e:
        return e

def get_gii_indicator_data(area_id, level, year):
    try:
        items=[]
        with connection.cursor() as cursor:
            sql = """SELECT t1.admin_level, t1.year, t1.area_id, t1.indicator_id, t1.admin_name, t1.value, t2.indicator_desc, t2.data, t2.unit, t3.common_id, t3.common_des
            FROM gii_indicator_data_table AS t1
            INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
            INNER JOIN gii_common_id_table AS t3 ON  t2.common_id = t3.common_id
            WHERE t1.area_id = """+area_id+""" AND t1.year = """+year+""" AND t1.admin_level = '"""+level+"""';"""

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                indicator_data = {
                "admin_level" : row[0],
                "year" : row[1],
                "area_id" : row[2],
                "indicator_id" : row[3],
                "admin_name" : row[4],
                "value" : round(row[5],2),
                "indicator_desc" : row[6],
                "data" : row[7],
                "unit" : row[8],
                "common_id" : row[9],
                "common_des" : row[10]
                }
                items.append(indicator_data)
        return items
    except Exception as e:
        return e

def get_adm0():
    try:
        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:
            sql = "select id_0, iso, name_0, area_id , st_AsGeoJSON(geom, 3) from adm0"
            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                "id_0" : row[0],
                "iso" : row[1],
                "name_0" : row[2],
                "area_id" : row[3],
                }

                feature = {
                "type": "Feature",
                "id": row[3],
                "properties": item,
                "geometry": json.loads(row[4])
                }


                features[0]["features"].append(feature)
        return features
    except Exception as e:
        return e

def get_country(id):
    try:
        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:
            sql = "select id_0, iso, name_0, area_id , st_AsGeoJSON(geom, 3) from adm0 where id_0="+id
            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                "id_0" : row[0],
                "iso" : row[1],
                "name_0" : row[2],
                "area_id" : row[3],
                }

                feature = {
                "type": "Feature",
                "id": row[3],
                "properties": item,
                "geometry": json.loads(row[4])
                }


                features[0]["features"].append(feature)
        return features
    except Exception as e:
        return e

def get_adm1(id):
    try:
        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:
            if id=='9999':
                sql = "select id_0, iso, name_0, id_1, name_1, area_id, st_AsGeoJSON(geom,3) from adm1 order by name_0, name_1;"
            else:
                sql = "select id_0, iso, name_0, id_1, name_1, area_id, st_AsGeoJSON(geom,3) from adm1 where id_0="+id+" order by name_0, name_1;"
            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                "id_0" : row[0] ,
                "iso" : row[1],
                "name_0" : row[2],
                "id_1" : row[3] ,
                "name_1" : row[4],
                "area_id" : row[5],
                }
                feature = {
                "type": "Feature",
                "id": row[5],
                "properties": item,
                "geometry": json.loads(row[6])
                }

                features[0]["features"].append(feature)

        return features
    except Exception as e:
        return e

def get_gii_sector():
    try:
        list=[]
        with connection.cursor() as cursor:
            sql = "select id, common_des, common_id from gii_common_id_table;"
            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                "gid" : row[0] ,
                "common_desc" : row[1],
                "common_id" : row[2],
                }
                list.append(item)

        return list
    except Exception as e:
        return e

def get_gii_indicators(id):
    try:
        list=[]
        with connection.cursor() as cursor:
            # if id=='9999':
            #     sql = "select count(g.id), g.indicator_desc, g.common_id, g.indicator_id, g.unit from gii_indicators_table g GROUP BY g.indicator_desc, g.common_id, g.indicator_id, g.unit;"
            # else:
            #     sql = "select count(g.id), g.indicator_desc, g.common_id, g.indicator_id, g.unit from gii_indicators_table g where common_id='"+id+"' GROUP BY g.indicator_desc, g.common_id, g.indicator_id, g.unit;"

            if id=='9999':
                sql = "select  g.indicator_desc, g.common_id, g.indicator_id, g.unit from gii_indicators_table g group by  indicator_desc, common_id, indicator_id, unit;"
            else:
                sql = "select  g.indicator_desc, g.common_id, g.indicator_id, g.unit from gii_indicators_table g where common_id='"+id+"' group by  indicator_desc, common_id, indicator_id, unit;"

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                # "count" : row[0],
                "indicator_desc" : row[0],
                "common_id" : row[1],
                "indicator_id" : row[2],
                "unit": row[3],
                # "data": row[4]
                }
                list.append(item)

        return list
    except Exception as e:
        return e

def get_gii_indicators_1(id):
    try:
        list=[]
        with connection.cursor() as cursor:
            # if id=='9999':
            #     sql = "select count(g.id), g.indicator_desc, g.common_id, g.indicator_id, g.unit from gii_indicators_table g GROUP BY g.indicator_desc, g.common_id, g.indicator_id, g.unit;"
            # else:
            #     sql = "select count(g.id), g.indicator_desc, g.common_id, g.indicator_id, g.unit from gii_indicators_table g where common_id='"+id+"' GROUP BY g.indicator_desc, g.common_id, g.indicator_id, g.unit;"

            if id=='9999':
                sql = "select  g.indicator_desc, g.common_id, g.indicator_id, g.unit from gii_indicators_table g where g.data in ['fam] group by  indicator_desc, common_id, indicator_id, unit;"
            else:
                sql = "select  g.indicator_desc, g.common_id, g.indicator_id, g.unit from gii_indicators_table g where common_id='"+id+"' group by  indicator_desc, common_id, indicator_id, unit;"

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                # "count" : row[0],
                "indicator_desc" : row[0],
                "common_id" : row[1],
                "indicator_id" : row[2],
                "unit": row[3],
                # "data": row[4]
                }
                list.append(item)

        return list
    except Exception as e:
        return e

def get_main_sector(country_id):
    try:
        list=[]
        with connection.cursor() as cursor:
            sql = """SELECT count(t4.section_id), t4.section_id, t4.section_name
            FROM data_table AS t1
            INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
            INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
            INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
            INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id
            WHERE t5.id_0 = """+ country_id + """
            GROUP BY t4.section_id, t4.section_name ORDER BY t4.section_name; """

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                "id" : row[0] ,
                "section_id" : row[1],
                "section_name" : row[2],
                }
                list.append(item)

        return list
    except Exception as e:
        return e

def get_dataset_l1(id, country_id):
    try:
        list=[]
        with connection.cursor() as cursor:
            sql = """SELECT count(t3.dataset_id_l1), t4.section_id, t4.section_name, t3.dataset_id_l1, t3.dataset_name_l1
                    FROM data_table AS t1
                    INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
                    INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
                    INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
                    INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id
                    WHERE t3.section_id = """+id+""" AND t5.id_0 = """+ country_id + """
                    GROUP BY t4.section_id, t4.section_name, t3.dataset_id_l1,  t3.dataset_name_l1 ORDER BY t3.dataset_name_l1;"""

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                "count" : row[0] ,
                "dataset_id_l1" : row[3],
                "dataset_name_l1" : row[4],
                }
                list.append(item)

        return list
    except Exception as e:
        return e


# def get_dataset(id):
#     try:
#         list=[]
#         with connection.cursor() as cursor:
#             if id=='9999':
#                 sql = """SELECT t1.dataset_id_l1, t1.dataset_id_l2,  t2.dataset_name_l1, t1.dataset_name_l2, t1.data, t1.unit,
#                 t1.data_source, t3.section_id, t3.section_name, t1.dataset_id  FROM dataset_l2_table t1
#                 INNER JOIN dataset_l1_table t2 ON t1.dataset_id_l1 = t2.dataset_id_l1
#                 INNER JOIN dataset_section_table t3 ON t2.section_id = t3.section_id;"""
#             else:
#                 sql = """SELECT t1.dataset_id_l1, t1.dataset_id_l2,  t2.dataset_name_l1, t1.dataset_name_l2, t1.data, t1.unit,
#                 t1.data_source, t3.section_id, t3.section_name, t1.dataset_id  FROM dataset_l2_table t1
#                 INNER JOIN dataset_l1_table t2 ON t1.dataset_id_l1 = t2.dataset_id_l1
#                 INNER JOIN dataset_section_table t3 ON t2.section_id = t3.section_id WHERE t3.section_id ="""+id+""" ORDER BY t1.dataset_name_l2;"""
#             print(sql)
#             cursor.execute(sql)
#             data = cursor.fetchall()
#             for row in data:
#                 item = {
#                 "dataset_id_l1" : row[0],
#                 "dataset_id_l2" : row[1],
#                 "dataset_name_l1" : row[2],
#                 "dataset_name_l2" : row[3],
#                 "data" : row[4],
#                 "unit" : row[5],
#                 "data_source" : row[6],
#                 "section_id" : row[7],
#                 "section_name" : row[8],
#                 "dataset_id": row[9]
#                 }
#                 list.append(item)

#         return list
#     except Exception as e:
#         return e




def get_dataset(id, country_id):
    try:
        list=[]
        with connection.cursor() as cursor:
            if id=='9999':
                sql = """SELECT count(t1.id), t4.section_id, t4.section_name, t3.dataset_id_l1, t3.dataset_name_l1, t2.dataset_name_l2
                FROM data_table AS t1
                INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
                INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
                INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
                INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id
                GROUP BY t4.section_id, t4.section_name, t3.dataset_id_l1, t3.dataset_name_l1, t2.dataset_name_l2 ORDER BY t3.dataset_id_l1;"""
            else:
                sql = """SELECT count(t1.id), t4.section_id, t4.section_name, t3.dataset_id_l1, t3.dataset_name_l1, t2.dataset_name_l2
                FROM data_table AS t1
                INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
                INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
                INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
                INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id
                WHERE t3.section_id ="""+id+""" AND t5.id_0 = """+ country_id +"""
                GROUP BY t4.section_id, t4.section_name, t3.dataset_id_l1, t3.dataset_name_l1, t2.dataset_name_l2 ORDER BY t3.dataset_id_l1;"""

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                "count" : row[0],
                "section_id" : row[1],
                "section_name" : row[2],
                "dataset_id_l1" : row[3],
                "dataset_name_l1" : row[4],
                "dataset_name_l2" : row[5]
                }
                list.append(item)

        return list
    except Exception as e:
        return e

def get_dataset_download(id, country_id):
    try:
        list=[]
        with connection.cursor() as cursor:
            if id=='9999':
                sql = """SELECT count(t1.id), t1.dataset_id, t4.section_id,
                t4.section_name, t3.dataset_id_l1, t2.dataset_id_l2, t3.dataset_name_l1,  t2.dataset_name_l2, t2.data, t2.unit
                FROM data_table AS t1
                INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
                INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
                INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
                INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id
                GROUP BY t1.dataset_id, t4.section_id, t4.section_name, t3.dataset_id_l1, t2.dataset_id_l2, t3.dataset_name_l1, t2.dataset_name_l2, t2.data, t2.unit ORDER BY t2.dataset_name_l2;"""
            else:
                sql = """SELECT count(t1.id), t1.dataset_id, t4.section_id,
                t4.section_name, t3.dataset_id_l1, t2.dataset_id_l2, t3.dataset_name_l1,  t2.dataset_name_l2, t2.data, t2.unit
                FROM data_table AS t1
                INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
                INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
                INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
                INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id
                WHERE t3.section_id ="""+id+""" AND t5.id_0 = """+ country_id +"""
                GROUP BY t1.dataset_id, t4.section_id, t4.section_name, t3.dataset_id_l1, t2.dataset_id_l2, t3.dataset_name_l1, t2.dataset_name_l2, t2.data, t2.unit ORDER BY t2.dataset_name_l2;"""

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                item = {
                "count" : row[0],
                "dataset_id" : row[1],
                "section_id" : row[2],
                "section_name" : row[3],
                "dataset_id_l1" : row[4],
                "dataset_id_l2" : row[5],
                "dataset_name_l1" : row[6],
                "dataset_name_l2" : row[7],
                "data" : row[8],
                "unit": row[9]
                }
                list.append(item)

        return list
    except Exception as e:
        return e


def download_dataset(dataset_id, admin_level, area_id, country_id, start_year, end_year):
    try:
        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })

        with connection.cursor() as cursor:

            mainSqlCountry = """SELECT t1.id, t1.area_id, t1.year, t1.dataset_id, t1.value, t2.data, t2.unit,
            t4.section_id, t3.dataset_id_l1, t2.dataset_id_l2,
            t4.section_name, t3.dataset_name_l1, t2.dataset_name_l2,
            t5.name_0, st_AsGeoJSON(t5.geom, 3)
            FROM data_table AS t1
            INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
            INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
            INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
            INNER JOIN adm0 AS t5 ON t1.area_id = t5.area_id WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+""" AND t1.dataset_id = """+dataset_id+""" AND t1.admin_level = '"""+admin_level+"""' """

            mainSqlProvince = """SELECT t1.id, t1.area_id, t1.year, t1.dataset_id, t1.value, t2.data, t2.unit,
            t4.section_id, t3.dataset_id_l1, t2.dataset_id_l2,
            t4.section_name, t3.dataset_name_l1, t2.dataset_name_l2,
            t5.name_1, st_AsGeoJSON(t5.geom, 3)
            FROM data_table AS t1
            INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
            INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
            INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
            INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id WHERE t1.year BETWEEN """+start_year+""" AND """+end_year+""" AND t1.dataset_id = """+dataset_id+""" AND t1.admin_level = '"""+admin_level+"""' """

            if admin_level =='country':
                sql = mainSqlCountry + """ AND t5.id_0= """+country_id+""" """

            elif admin_level=='province' and area_id != '9999':
                sql = mainSqlProvince + """ AND t1.area_id::text in ("""+area_id+""")"""

            elif admin_level=='province' and area_id == '9999':
                sql = mainSqlProvince+ """ AND t5.id_0= """+country_id+""" """

            cursor.execute(sql)
            data = cursor.fetchall()

            for row in data:
                feature_prop  = {
                "area_id": row[1],
                "year": row[2],
                "dataset_id": row[3],
                "value": row[4],
                "data": row[5],
                "unit": row[6],
                "section_id": row[7],
                "dataset_id_l1": row[8],
                "dataset_id_l2": row[9],
                "section_name": row[10],
                "dataset_name_l1": row[11],
                "dataset_name_l2": row[12],
                "area_name": row[13],
                }

                feature = {
                "type": "Feature",
                "name": row[13],
                "id": row[0],
                "properties": feature_prop,
                "geometry": json.loads(row[14])
                }

                features[0]["features"].append(feature)

        return features
    except Exception as e:
        return e

def get_datasetMap(dataset_id, area_id, level, gender_type, year, country_id, dataset_id_l1):
    try:

        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:

            mainSqlCountry = """SELECT t1.id, t1.area_id, t1.year, t1.dataset_id, t1.value, t2.data, t2.unit,
            t4.section_id, t3.dataset_id_l1, t2.dataset_id_l2,
            t4.section_name, t3.dataset_id_l1, t2.dataset_name_l2,
            t5.name_0, st_AsGeoJSON(t5.geom, 3)
            FROM data_table AS t1
            INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
            INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
            INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
            INNER JOIN adm0 AS t5 ON t1.area_id = t5.area_id WHERE t1.year = """+year+""" AND t1.dataset_id = """+dataset_id+""" AND t1.admin_level = '"""+level+"""' """

            mainSqlProvince = """SELECT t1.id, t1.area_id, t1.year, t1.dataset_id, t1.value, t2.data, t2.unit,
            t4.section_id, t3.dataset_id_l1, t2.dataset_id_l2,
            t4.section_name, t3.dataset_id_l1, t2.dataset_name_l2,
            t5.name_1, st_AsGeoJSON(t5.geom, 3)
            FROM data_table AS t1
            INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
            INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
            INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
            INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id WHERE t1.year = """+year+""" AND t1.dataset_id = """+dataset_id+""" AND t1.admin_level = '"""+level+"""' """

            if level=='country' and area_id == '9999' and country_id == '9999' :
                sql = mainSqlCountry

            elif level=='country' and area_id != '9999':
                sql = mainSqlCountry + """ AND t1.area_id::text in ("""+area_id+""")"""

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainSqlCountry + """ AND t5.id_0= """+country_id+""" """

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainSqlCountry

            elif level=='province' and area_id == '9999' and country_id == '9999':
                sql = mainSqlProvince

            elif level=='province' and area_id != '9999':
                sql = mainSqlProvince + """ AND t1.area_id::text in ("""+area_id+""")"""

            elif level=='province' and area_id == '9999' and country_id !='':

                sql = mainSqlProvince+ """ AND t5.id_0= """+country_id+""" """

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainSqlProvince

            # sql = sql+ """ AND t1.value > 0"""

            cursor.execute(sql)
            data = cursor.fetchall()

            for row in data:
                feature_prop = {
                "area_id": row[1],
                "year": row[2],
                "dataset_id": row[3],
                "value": row[4],
                "data": row[5],
                "unit": row[6],
                "area_name": row[13],
                }

                feature = {
                "type": "Feature",
                "name": row[13],
                "id": row[0],
                "properties": feature_prop,
                "geometry": json.loads(row[14])
                }


                features[0]["features"].append(feature)

        return features
    except Exception as e:
        return e

def check_data(dataset_id_l1):
    try:
        with connection.cursor() as cursor:
            sql = """select data, calc from dataset_l2_table where dataset_id_l1 = """+dataset_id_l1+""" group by data, calc"""
            cursor.execute(sql)
            data = cursor.fetchall()
            result = {}

            if len(data) > 1:
                result = {
                 "number": 2,
                 "data": 'FM',
                 "calc": data[0][1]
                }
            elif len(data) == 1:
                result = {
                 "number": 1,
                 "data": data[0][0],
                 "calc": data[0][1]
                }
            else:
                result = {
                 "number": 0,
                 "data": 'no',
                 "calc": 'no'
                }

            return result
    except Exception as e:
        return e

def check_dimension_data(data_id):
    try:
        with connection.cursor() as cursor:
            sql = """select dt.data, dt.unit from gii_dimension_table dt 
                inner join gii_dimension_data_table ddt on dt.dimension_id = ddt.dimension_id 
                where common_id = '"""+data_id+"""' group by dt.data, dt.unit;  """
            cursor.execute(sql)
            data = cursor.fetchall()
            result = []

            for row in data:
                dict = {
                    "data": row[0],
                    "unit": row[1]
                }
                result.append(dict)

            return result
    except Exception as e:
        return e

def check_indicator_data(data_id):
    try:
        with connection.cursor() as cursor:
            sql = """select t.data, t.unit from gii_indicators_table t where indicator_id = '"""+data_id+"""' """
            cursor.execute(sql)
            data = cursor.fetchall()
            result = []

            for row in data:
                dict = {
                    "data": row[0],
                    "unit": row[1]
                }
                result.append(dict)

            return result
    except Exception as e:
        return e

def find_dataset_id_l2(dataset_id_l1, dataset_name_l2, gender_type):
    try:
        res = {}
        with connection.cursor() as cursor:
            sql = """select dataset_id_l2, definition from dataset_l2_table
                    where dataset_id_l1 = """+dataset_id_l1+"""
                    and data = '"""+gender_type+"""'
                    and dataset_name_l2 = '"""+dataset_name_l2+"""'"""
            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                data_id = row[0]
                definition = row[1]
            #close connection
            connection.close ()
            res = {
                'dataset_id': data_id,
                'definition': definition
            }
            return res
    except Exception as e:
        return e

def find_unique_indicator_id(indicator_id, gender_type):
    try:
        res = {}
        with connection.cursor() as cursor:
            sql = """select unique_indicator_id from gii_indicators_table
                    where indicator_id = '"""+indicator_id+"""'
                    and data = '"""+gender_type+"""'"""

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                data_id = row[0]
                res = {
                'unique_indicator_id': data_id,
                }
            #close connection
            connection.close ()

            return res
    except Exception as e:
        return e




def check_available_year(id, country_id, dataset_id_l1, gender_type):
    try:
        list=[]
        with connection.cursor() as cursor:
            sql = """SELECT t1.year
                    FROM data_table AS t1
                    INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
                    INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
                    INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
                    INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id
                    WHERE t3.section_id = """+id+""" AND t5.id_0 = """+ country_id + """ AND t3.dataset_id_l1 = """+ dataset_id_l1 + """ AND t2.data = '"""+gender_type+"""' AND t1.year BETWEEN 2000 and 2021
                    GROUP BY t1.year ORDER BY t1.year; """

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                list.append(row[0])

        return list
    except Exception as e:
        return e


def get_GenderGapMap(dataset_id, area_id, level, gender_type, year, country_id, dataset_name_l2, dataset_id_l1):
    try:

        features=[]
        features.append({
                        "type": "FeatureCollection",
                        "features": []
                    })
        with connection.cursor() as cursor:

            # mainSqlCountry = """SELECT t1.id, t1.area_id, t1.year, t1.dataset_id, t1.value, t2.data, t2.unit,
            # t4.section_id, t3.dataset_id_l1, t2.dataset_id_l2,
            # t4.section_name, t3.dataset_id_l1, t2.dataset_name_l2,
            # t5.name_0, st_AsGeoJSON(t5.geom, 3), t1.calc
            # FROM data_table AS t1
            # INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
            # INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
            # INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
            # INNER JOIN adm0 AS t5 ON t1.area_id = t5.area_id WHERE t1.year = """+year+""" AND t2.dataset_name_l2 = """+dataset_name_l2+""" AND t2.dataset_id_l1 = '"""+dataset_id_l1+"""' AND t2.data = '"""+gender_type+"""' AND t1.admin_level = '"""+level+"""' AND t1.value > 0 """

            # mainSqlProvince = """SELECT t1.id, t1.area_id, t1.year, t1.dataset_id, t1.value, t2.data, t2.unit,
            # t4.section_id, t3.dataset_id_l1, t2.dataset_id_l2,
            # t4.section_name, t3.dataset_id_l1, t2.dataset_name_l2,
            # t5.name_1, st_AsGeoJSON(t5.geom, 3), t1.calc
            # FROM data_table AS t1
            # INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
            # INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
            # INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
            # INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id WHERE t1.year = """+year+""" AND t2.dataset_name_l2 = '"""+dataset_name_l2+"""'  AND t2.dataset_id_l1 = """+dataset_id_l1+""" AND t2.data = '"""+gender_type+"""'  AND t1.admin_level = '"""+level+"""' AND t1.value > 0 """

            mainSqlCountry = """SELECT t1.id, t1.area_id, t1.year, t1.dataset_id, t1.value, t2.data, t2.unit,
            t4.section_id, t3.dataset_id_l1, t2.dataset_id_l2,
            t4.section_name, t3.dataset_id_l1, t2.dataset_name_l2,
            t5.name_0, st_AsGeoJSON(t5.geom, 3), t1.calc
            FROM data_table AS t1
            INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
            INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
            INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
            INNER JOIN adm0 AS t5 ON t1.area_id = t5.area_id WHERE t1.year = """+year+""" AND t2.dataset_name_l2 = """+dataset_name_l2+""" AND t2.dataset_id_l1 = '"""+dataset_id_l1+"""' AND t2.data = '"""+gender_type+"""' AND t1.admin_level = '"""+level+"""' """

            mainSqlProvince = """SELECT t1.id, t1.area_id, t1.year, t1.dataset_id, t1.value, t2.data, t2.unit,
            t4.section_id, t3.dataset_id_l1, t2.dataset_id_l2,
            t4.section_name, t3.dataset_id_l1, t2.dataset_name_l2,
            t5.name_1, st_AsGeoJSON(t5.geom, 3), t1.calc
            FROM data_table AS t1
            INNER JOIN dataset_l2_table AS t2 ON t1.dataset_id = t2.dataset_id
            INNER JOIN dataset_l1_table AS t3 ON t2.dataset_id_l1 = t3.dataset_id_l1
            INNER JOIN dataset_section_table AS t4 ON t3.section_id = t4.section_id
            INNER JOIN adm1 AS t5 ON t1.area_id = t5.area_id WHERE t1.year = """+year+""" AND t2.dataset_name_l2 = '"""+dataset_name_l2+"""'  AND t2.dataset_id_l1 = """+dataset_id_l1+""" AND t2.data = '"""+gender_type+"""'  AND t1.admin_level = '"""+level+"""' """


            if level=='country' and area_id == '9999' and country_id == '9999' :
                sql = mainSqlCountry

            elif level=='country' and area_id != '9999':
                sql = mainSqlCountry + """ AND t1.area_id::text in ("""+area_id+""")"""

            elif level=='country' and area_id == '9999' and country_id !='':
                sql = mainSqlCountry + """ AND t5.id_0= """+country_id+""" """

            elif level=='country' and area_id == '9999' and country_id =='':
                sql = mainSqlCountry

            elif level=='province' and area_id == '9999' and country_id == '9999':
                sql = mainSqlProvince

            elif level=='province' and area_id != '9999':
                sql = mainSqlProvince + """ AND t1.area_id::text in ("""+area_id+""")"""

            elif level=='province' and area_id == '9999' and country_id !='':

                sql = mainSqlProvince+ """ AND t5.id_0= """+country_id+""" """

            elif level=='province' and area_id == '9999' and country_id =='':
                sql = mainSqlProvince


            cursor.execute(sql)
            data = cursor.fetchall()

            for row in data:
                feature_prop = {
                "area_id": row[1],
                "year": row[2],
                "dataset_id": row[3],
                "value": row[4],
                "data": row[5],
                "unit": row[6],
                "area_name": row[13],
                "calc": row[15],
                }

                feature = {
                "type": "Feature",
                "name": row[13],
                "id": row[0],
                "properties": feature_prop,
                "geometry": json.loads(row[14])
                }


                features[0]["features"].append(feature)

        return features
    except Exception as e:
        return e




def get_indicator_data(area_id, level, year, indicator_id):
    try:

        features=[]
        with connection.cursor() as cursor:

            if level=='country':
                sql = """SELECT female.admin_level, female.area_id, female.year, female.indicator_id, female.indicator_desc, female.value as female, male.value as male, female.name_0 FROM (SELECT t1.id, t1.admin_level, t1.year, t1.value, t1.area_id,  t2.indicator_id, t2.indicator_desc, t2.data, t2.unit, t4.name_0, st_AsGeoJSON(t4.geom, 3)
            FROM gii_indicator_data_table AS t1
            INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
            INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.indicator_id= '"""+indicator_id+"""' AND t4.area_id::text in ("""+area_id+""") AND t2.data = 'female') AS female

            LEFT JOIN (SELECT t1.id, t1.admin_level, t1.year, t1.value, t1.area_id, t2.indicator_id, t2.indicator_desc, t2.data, t2.unit, t4.name_0, st_AsGeoJSON(t4.geom, 3)
            FROM gii_indicator_data_table AS t1
            INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
            INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.indicator_id= '"""+indicator_id+"""' AND t4.area_id::text in ("""+area_id+""")  AND t2.data = 'male') AS male ON female.area_id = male.area_id AND female.year = male.year AND female.indicator_id = male.indicator_id
            """


            elif level=='province':
                sql ="""SELECT female.admin_level, female.area_id, female.year, female.indicator_id, female.indicator_desc, female.value as female, male.value as male, female.name_0, female.name_1  FROM (SELECT t1.id, t1.admin_level, t1.year, t1.value, t1.area_id,  t2.indicator_id, t2.indicator_desc, t2.data, t2.unit, t4.name_0, t4.name_1, st_AsGeoJSON(t4.geom, 3)
            FROM gii_indicator_data_table AS t1
            INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
            INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.indicator_id= '"""+indicator_id+"""' AND t4.area_id::text in ("""+area_id+""") AND t2.data = 'female') AS female

            LEFT JOIN (SELECT t1.id, t1.admin_level, t1.year, t1.value, t1.area_id, t2.indicator_id, t2.indicator_desc, t2.data, t2.unit, t4.name_0, t4.name_1, st_AsGeoJSON(t4.geom, 3)
            FROM gii_indicator_data_table AS t1
            INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
            INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.indicator_id= '"""+indicator_id+"""' AND t4.area_id::text in ("""+area_id+""") AND t2.data = 'male') AS male ON female.area_id = male.area_id AND female.year = male.year AND female.indicator_id = male.indicator_id
            """

            cursor.execute(sql)
            data = cursor.fetchall()

            for row in data:
                if level=='country':
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "year": row[2],
                    "indicator_id": row[3],
                    "indicator_desc": row[4],
                    "female": row[5],
                    "male": row[6],
                    "name_0": row[7]
                    }
                else:
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "year": row[2],
                    "indicator_id": row[3],
                    "indicator_desc": row[4],
                    "female": row[5],
                    "male": row[6],
                    "name_0": row[7],
                    "name_1": row[8]
                    }
                features.append(feature_prop)

        return features
    except Exception as e:
        return e



def get_dimension_data(area_id, level, year, common_id):
    try:

        features=[]
        with connection.cursor() as cursor:
            if level=='country' and area_id == '9999':
                sql = """SELECT female.admin_level, female.area_id, female.year, female.common_id, female.common_des, female.value as female, male.value as male, male.name_0 FROM (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t1.admin_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, t4.name_0
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'female') AS female

                INNER JOIN (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t1.admin_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des,t4.name_0
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'male') AS male ON female.area_id = male.area_id AND female.year = male.year AND female.common_id = male.common_id """


            elif level=='country' and area_id != '9999':
                sql = """SELECT female.admin_level, female.area_id, female.year, female.common_id, female.common_des, female.value as female, male.value as male, male.name_0 FROM (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t1.admin_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, t4.name_0
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'female' and t1.area_id::text in ("""+area_id+""")) AS female

                INNER JOIN (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t1.admin_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des,t4.name_0
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm0 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'male' and t1.area_id::text in ("""+area_id+""")) AS male ON female.area_id = male.area_id AND female.year = male.year AND female.common_id = male.common_id """

            elif level=='province' and area_id == '9999':
                sql = """SELECT female.admin_level, female.area_id, female.year, female.common_id, female.common_des, female.value as female, male.value as male, male.name_0, male.name_1 FROM (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t1.admin_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, t4.name_0, t4.name_1
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'female') AS female

                INNER JOIN (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t1.admin_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des,t4.name_0, t4.name_1
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'male') AS male ON female.area_id = male.area_id AND female.year = male.year AND female.common_id = male.common_id """


            elif level=='province' and area_id != '9999':
                sql = """SELECT female.admin_level, female.area_id, female.year, female.common_id, female.common_des, female.value as female, male.value as male, male.name_0, male.name_1 FROM (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t1.admin_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des, t4.name_0, t4.name_1
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'female' and t1.area_id::text in ("""+area_id+""")) AS female

                INNER JOIN (SELECT t1.admin_level, t1.area_id, t1.year, t1.dimension_id, t1.value, t1.admin_name, t2.dimension_desc, t2.data, t2.unit, t3.common_id, t3.common_des,t4.name_0, t4.name_1
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id
                WHERE t1.year = """+year+""" AND t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+common_id+"""' AND t2.data= 'male' and t1.area_id::text in ("""+area_id+""")) AS male ON female.area_id = male.area_id AND female.year = male.year AND female.common_id = male.common_id """


            cursor.execute(sql)
            data = cursor.fetchall()

            for row in data:
                if level=='country':
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "year": row[2],
                    "common_id": row[3],
                    "common_des": row[4],
                    "female": row[5],
                    "male": row[6],
                    "name_0": row[7]
                    }
                else:
                    feature_prop = {
                    "admin_level": row[0],
                    "area_id": row[1],
                    "year": row[2],
                    "common_id": row[3],
                    "common_des": row[4],
                    "female": row[5],
                    "male": row[6],
                    "name_0": row[7],
                    "name_1": row[8]
                    }
                features.append(feature_prop)

        return features
    except Exception as e:
        return e

def check_gii_available_year(type, level, data_id, data, area_id):
    try:
        list=[]
        with connection.cursor() as cursor:
            if level == 'country':
                area_filter = """and t1.area_id::text in ("""+area_id+""")"""
                _join = """INNER JOIN adm1 AS t4 ON t1.area_id = t4.id_0"""
            elif level == 'province':
                area_filter = """and t4.id_0::text in ("""+area_id+""")"""
                _join = """INNER JOIN adm1 AS t4 ON t1.area_id = t4.area_id"""

            if type == 'gii':
                sql = """SELECT t1.year FROM gii_gender_indices_table AS t1 """+_join+""" WHERE t1.admin_level = '"""+level+"""' and t4.id_0::text in ("""+area_id+""") GROUP BY t1.year;"""

            elif type == 'dimension':
                sql = """SELECT t1.year
                FROM gii_dimension_data_table AS t1
                INNER JOIN gii_dimension_table AS t2 ON t1.dimension_id = t2.dimension_id
                INNER JOIN gii_common_id_table AS t3 ON t2.common_id = t3.common_id
                """+_join+"""  WHERE t1.admin_level = '"""+level+"""' AND t2.common_id= '"""+data_id+"""'  """+area_filter+""" and t2.data='"""+data+"""' GROUP BY t1.year;"""

            elif type == 'indicator':
                sql = """SELECT t1.year
                FROM gii_indicator_data_table AS t1
                INNER JOIN gii_indicators_table AS t2 ON t1.indicator_id = t2.unique_indicator_id
                """+_join+"""  WHERE t1.admin_level = '"""+level+"""' AND t2.indicator_id= '"""+data_id+"""' """+area_filter+""" and t2.data='"""+data+"""' GROUP BY t1.year;"""

            cursor.execute(sql)
            data = cursor.fetchall()
            for row in data:
                list.append(row[0])

        return list
    except Exception as e:
        return e
