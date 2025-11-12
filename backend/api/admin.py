from django.contrib import admin
from .models import (
    Korisnik, Uloga, Sastanak, StatusSastanka,
    Obavijesti, Sudjeluje, TockeDnevReda, Rasprava, Zakljucak
)


@admin.register(Uloga)
class UlogaAdmin(admin.ModelAdmin):
    list_display = ['id_uloge', 'naziv_uloge']
    search_fields = ['naziv_uloge']


@admin.register(Korisnik)
class KorisnikAdmin(admin.ModelAdmin):
    list_display = ['id_korisnik', 'korisnicko_ime', 'email', 'aktivan', 'registriran_od', 'id_uloge']
    list_filter = ['aktivan', 'id_uloge', 'registriran_od']
    search_fields = ['korisnicko_ime', 'email']
    readonly_fields = ['registriran_od', 'password_hash']
    fieldsets = (
        ('Osnovni podaci', {
            'fields': ('korisnicko_ime', 'email', 'id_uloge')
        }),
        ('Status', {
            'fields': ('aktivan', 'registriran_od')
        }),
        ('Sigurnost', {
            'fields': ('password_hash',),
            'classes': ('collapse',)
        }),
    )


@admin.register(StatusSastanka)
class StatusSastankaAdmin(admin.ModelAdmin):
    list_display = ['id_status', 'naziv_status']
    search_fields = ['naziv_status']


@admin.register(Sastanak)
class SastanakAdmin(admin.ModelAdmin):
    list_display = ['id_sastanak', 'naslov', 'datum_vrijeme', 'lokacija', 'id_korisnik', 'id_status']
    list_filter = ['id_status', 'datum_vrijeme']
    search_fields = ['naslov', 'lokacija']
    date_hierarchy = 'datum_vrijeme'


@admin.register(Obavijesti)
class ObavijestiAdmin(admin.ModelAdmin):
    list_display = ['id_obavijesti', 'poruka', 'poslano_u', 'status_mail', 'id_sastanak']
    list_filter = ['status_mail', 'poslano_u']
    search_fields = ['poruka']


@admin.register(Sudjeluje)
class SudjelujeAdmin(admin.ModelAdmin):
    list_display = ['id_sudjelovanja', 'id_korisnik', 'id_sastanak', 'potvrda', 'vrijeme_potvrde']
    list_filter = ['potvrda', 'vrijeme_potvrde']
    search_fields = ['id_korisnik__korisnicko_ime', 'id_sastanak__naslov']


@admin.register(TockeDnevReda)
class TockeDnevRedaAdmin(admin.ModelAdmin):
    list_display = ['id_tocke', 'broj_tocke', 'naziv', 'pravni_ucinak', 'id_sastanak']
    list_filter = ['pravni_ucinak']
    search_fields = ['naziv', 'opis']


@admin.register(Rasprava)
class RaspravaAdmin(admin.ModelAdmin):
    list_display = ['id_rasprave', 'url_stanblog', 'id_tocke']
    search_fields = ['url_stanblog']


@admin.register(Zakljucak)
class ZakljucakAdmin(admin.ModelAdmin):
    list_display = ['id_zakljucak', 'tekst', 'status', 'unesen_u', 'id_korisnik', 'id_tocke']
    list_filter = ['status', 'unesen_u']
    search_fields = ['tekst']
    date_hierarchy = 'unesen_u'