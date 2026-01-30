"""
Custom permissions for role-based access control
"""
from rest_framework import permissions


class IsConsumer(permissions.BasePermission):
    """
    Permission to only allow consumers to access a view
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'CONSUMER'


class IsMason(permissions.BasePermission):
    """
    Permission to only allow masons to access a view
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'MASON'


class IsTrader(permissions.BasePermission):
    """
    Permission to only allow traders to access a view
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'TRADER'


class IsMasonOrTrader(permissions.BasePermission):
    """
    Permission to allow both masons and traders to access a view
    """
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role in ['MASON', 'TRADER'])


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners to edit an object
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to owner
        # Assumes obj has a 'user' or 'consumer' or 'bidder' attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'consumer'):
            return obj.consumer == request.user
        elif hasattr(obj, 'bidder'):
            return obj.bidder == request.user
        
        return False


class IsJobOwner(permissions.BasePermission):
    """
    Permission to only allow job owner to perform action
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.consumer == request.user
