from django.core.management.base import BaseCommand
from backend.products.models import Product

class Command(BaseCommand):
    help = 'Updates the image URLs for existing products'

    def handle(self, *args, **options):
        product_images = {
            "Mangoes": "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=400&q=80",
            "Apples": "https://images.unsplash.com/photo-1560806887-1e4cd0b69665?auto=format&fit=crop&w=400&q=80",
            "Bananas": "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80",
            "Lychee": "https://images.unsplash.com/photo-1627382219423-5494d187e34c?auto=format&fit=crop&w=400&q=80",
            "Jamun": "https://images.unsplash.com/photo-1627382219423-5494d187e34c?auto=format&fit=crop&w=400&q=80",
            "Potato": "https://images.unsplash.com/photo-1590326048384-2a6a8b79b97a?auto=format&fit=crop&w=400&q=80",
            "Onion": "https://images.unsplash.com/photo-1587334237935-66bdee359345?auto=format&fit=crop&w=400&q=80",
            "Tomato": "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=400&q=80",
            "Cheese": "https://images.unsplash.com/photo-1628013825792-780126b384f5?auto=format&fit=crop&w=400&q=80",
            "Paneer": "https://plus.unsplash.com/premium_photo-1668618482869-63cf106358a9?auto=format&fit=crop&w=400&q=80",
            "Milk": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=400&q=80",
            "Wheat": "https://images.unsplash.com/photo-1534952219639-c19053940aa3?auto=format&fit=crop&w=400&q=80",
            "Indrayani Rice": "https://images.unsplash.com/photo-1586201375822-52c67340e4f4?auto=format&fit=crop&w=400&q=80",
            "Basmati Rice": "https://images.unsplash.com/photo-1586201375822-52c67340e4f4?auto=format&fit=crop&w=400&q=80",
        }

        for product_name, image_url in product_images.items():
            try:
                product = Product.objects.get(name=product_name)
                product.image = image_url
                product.save()
                self.stdout.write(self.style.SUCCESS(f'Successfully updated image for "{product_name}"'))
            except Product.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Product "{product_name}" not found')) 