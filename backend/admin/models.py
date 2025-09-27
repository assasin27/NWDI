from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AdminProfile(models.Model):
    """
    Extended profile for admin users with farm-specific information.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='admin_profile'
    )
    farm_name = models.CharField(
        max_length=255,
        default='Nareshwadi Farm',
        help_text='Name of the farm or business'
    )
    description = models.TextField(
        default='Organic farm providing fresh produce',
        help_text='Description of the farm/business'
    )
    region = models.CharField(
        max_length=100,
        default='Nareshwadi',
        help_text='Geographic region where the farm is located'
    )
    contact_email = models.EmailField(
        blank=True,
        null=True,
        help_text='Business contact email'
    )
    contact_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text='Business contact phone number'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Admin Profile'
        verbose_name_plural = 'Admin Profiles'

    def __str__(self):
        return f"{self.farm_name} - {self.user.email}"
