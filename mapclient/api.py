# -*- coding: utf-8 -*-

from mapclient.core import get_gii, get_line_chart_data, get_adm0, get_indicator_data, find_dataset_id_l2, get_dataset_download, find_unique_indicator_id, check_indicator_data, check_available_year, check_gii_available_year, download_dataset, get_country, check_data, get_adm1, get_dataset_l1, get_GenderGapMap, get_gii_sector, get_gii_indicators, get_gii_dimension_group, get_gii_dimension_data, get_gii_indicator_data, get_gii_indicator_group, get_gii_dimension_map, get_main_sector, get_dataset, get_datasetMap, download_gii, download_gii_dimension, download_gii_indicator, get_dimension_data, get_gii_indicator_map, get_dimension_line_chart_data, check_dimension_data
from django.conf import settings
from django.http import JsonResponse
from datetime import datetime
import json
import time


def api(request):

    get = request.GET.get
    action = get('action', '')

    if action:
        public_methods = ['get-gii', 'get-adm0', 'get-adm1', 'get-gii-sector', 'get-gii-indicators', 'check_data', 'check_available_year', 'check_gii_available_year', 'get_dataset_download',
        'get-dimension-group', 'get-dimension-data', 'get-dimension-map', 'get-indicator-data' , 'get-gii-indicator-map', 'get-line-chart-data', 'download-indicator-data', 'check_indicator_data',
        'get-indicator-group' , 'get-main-sector-option' , 'get-dataset-option', 'get-dataset-map', 'download-gii', 'download-dimension-data', 'get-dimension-graph-data', 'find_unique_indicator_id',
        'get-dimension-line-chart-data', 'get-datasetl1-option','get-country', 'get-indicator-graph-data', 'download-dataset', 'get-gandergap-map' , 'find_dataset_id_l2', 'check_dimension_data']

        if action in public_methods:
            adm1_id = get('adm1_id', '')
            indicator_id = get('indicator_id', '')
            area_id = get('area_id','')
            admin_level = get('admin_level', '')
            country_id = get('country_id', '')
            year = get('year', '')
            common_id = get('common_id', '')
            gender_type = get('gender_type', '')
            sector_id = get('sector_id', '')
            dataset_id = get('dataset_id', '')
            start_year = get('start_year', '')
            end_year = get('end_year', '')
            dataset_id_l1 = get('dataset_id_l1', '')
            dataset_name_l2 = get('dataset_name_l2', '')
            check_data_level= get('check_data_level', '')
            data_id = get('data_id', '')

            if action == 'get-gii':
                data = get_gii(admin_level, area_id, country_id, year)

            elif action == 'get-line-chart-data':
                data = get_line_chart_data(admin_level, area_id, country_id, start_year, end_year)

            elif action == 'get-adm0':
                data = get_adm0()

            elif action == 'get-adm1':
                data = get_adm1(adm1_id)

            elif action == 'get-gii-sector':
                data = get_gii_sector()

            elif action == 'get-gii-indicators':
                data = get_gii_indicators(indicator_id)

            elif action == 'get-dimension-group':
                data = get_gii_dimension_group(area_id, admin_level, year)

            elif action == 'get-dimension-data':
                data = get_gii_dimension_data(area_id, admin_level, year)

            elif action == 'get-dimension-map':
                data = get_gii_dimension_map(area_id, admin_level, year, common_id, gender_type, country_id)

            elif action == 'get-dimension-graph-data':
                data = get_dimension_data(area_id, admin_level, year, common_id)

            elif action == 'get-indicator-graph-data':
                data = get_indicator_data(area_id, admin_level, year, indicator_id)

            elif action == 'get-indicator-data':
                data = get_gii_indicator_data(area_id, admin_level, year)

            elif action == 'get-indicator-group':
                data = get_gii_indicator_group(area_id, admin_level, year)

            elif action == 'get-main-sector-option':
                data = get_main_sector(country_id)

            elif action == 'get-datasetl1-option':
                data = get_dataset_l1(sector_id, country_id)

            elif action == 'get-dataset-option':
                data = get_dataset(sector_id, country_id)

            elif action == 'get_dataset_download':
                data = get_dataset_download(sector_id, country_id)

            elif action == 'get-dataset-map':
                data = get_datasetMap(dataset_id, area_id, admin_level, gender_type, year, country_id, dataset_id_l1)

            elif action == 'download-dimension-data':
                data = download_gii_dimension(area_id, admin_level, common_id, country_id, start_year, end_year)

            elif action == 'download-indicator-data':
                data = download_gii_indicator(area_id, admin_level, indicator_id, country_id, start_year, end_year)

            elif action == 'download-gii':
                data = download_gii(admin_level, area_id, country_id, start_year, end_year)

            elif action == 'get-gii-indicator-map':
                data = get_gii_indicator_map(area_id, admin_level, year, indicator_id, gender_type, country_id)

            elif action == 'get-dimension-line-chart-data':
                data =  get_dimension_line_chart_data(admin_level, area_id, common_id, gender_type,  country_id, start_year, end_year)

            elif action == 'get-country':
                data =  get_country(country_id)

            elif action == 'download-dataset':
                data = download_dataset(dataset_id, admin_level, area_id, country_id, start_year, end_year)

            elif action ==  'get-gandergap-map':
                data = get_GenderGapMap(dataset_id, area_id, admin_level, gender_type, year, country_id, dataset_name_l2, dataset_id_l1)

            elif action ==  'check_data':
                data = check_data(dataset_id_l1)

            elif action == 'check_dimension_data':
                data = check_dimension_data(data_id)

            elif action == 'check_indicator_data':
                data = check_indicator_data(data_id)

            elif action ==  'find_dataset_id_l2':
                data = find_dataset_id_l2(dataset_id_l1, dataset_name_l2, gender_type)

            elif action ==  'find_unique_indicator_id':
                data = find_unique_indicator_id(indicator_id, gender_type)

            elif action == 'check_available_year':
                data = check_available_year(sector_id, country_id, dataset_id_l1, gender_type)

            elif action == 'check_gii_available_year':
                data = check_gii_available_year(check_data_level, admin_level, data_id, gender_type, area_id)

            return JsonResponse(data, safe=False)
