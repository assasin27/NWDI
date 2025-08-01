from rest_framework import serializers
from .models import User, SellerProfile

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    is_seller = serializers.BooleanField(required=False)
    address = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_seller', 'address', 'phone', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        # If 'name' is provided by frontend, use it for username
        name = validated_data.pop('name', None)
        if name:
            validated_data['username'] = name
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = SellerProfile
        fields = ['id', 'user', 'farm_name', 'description', 'region', 'certification']
