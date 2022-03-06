"""gemtool URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from __future__ import absolute_import, print_function, unicode_literals

from cms.sitemaps import CMSSitemap
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.static import serve
from django.views.generic import TemplateView

from mapclient import api as mapclient_api
admin.autodiscover()


urlpatterns = [
    url(r'^sitemap\.xml$', sitemap,
        {'sitemaps': {'cmspages': CMSSitemap}}),

    url(r'^admin/', admin.site.urls),  
    #url(r'^$', TemplateView.as_view(template_name="map.html")),
    url(r'^$', TemplateView.as_view(template_name="home.html")),
    url(r'^map-dataset/', TemplateView.as_view(template_name="dataset.html")),
    url(r'^map/', TemplateView.as_view(template_name="map.html")),
    url(r'^reference/', TemplateView.as_view(template_name="reference.html")),
    url(r'^about/', TemplateView.as_view(template_name="about.html")),
    url(r'^download-data/', TemplateView.as_view(template_name="download-data.html")),
    url(r'^download-dataset/', TemplateView.as_view(template_name="download-dataset.html")),
    url(r'^api/mapclient/$', mapclient_api.api),

]

# urlpatterns += i18n_patterns(
#     url(r'^admin/', admin.site.urls),  
#     #url(r'^$', TemplateView.as_view(template_name="map.html")),
#     url(r'^$', TemplateView.as_view(template_name="home.html")),
#     url(r'^map-dataset/', TemplateView.as_view(template_name="dataset.html")),
#     url(r'^map/', TemplateView.as_view(template_name="map.html")),
#     url(r'^reference/', TemplateView.as_view(template_name="reference.html")),
#     url(r'^download-data/', TemplateView.as_view(template_name="download-data.html")),
#     url(r'^download-dataset/', TemplateView.as_view(template_name="download-dataset.html")),
#     url(r'^api/mapclient/$', mapclient_api.api),
#     # prefix_default_language=False,
# )
