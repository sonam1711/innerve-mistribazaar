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

class IsMistri(permissions.BasePermission):
    """
    Permission to only allow mistri (skilled workers) to access a view
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'MISTRI'

class IsContractor(permissions.BasePermission):
    """
    Permission to only allow contractors to access a view
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'CONTRACTOR'


class IsTrader(permissions.BasePermission):
    """
    Permission to only allow traders to access a view
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'TRADER'


class IsContractorOrTrader(permissions.BasePermission):
    """
    Permission to allow both contractors and traders to access a view
    """
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role in ['CONTRACTOR', 'TRADER'])

class IsMistriOrTrader(permissions.BasePermission):
    """
    Permission to allow both mistri and traders to access a view
    """
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role in ['MISTRI', 'TRADER'])


class IsProvider(permissions.BasePermission):
    """
    Permission to allow contractors, mistri, or traders (any service provider)
    """
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role in ['CONTRACTOR', 'MISTRI', 'TRADER'])

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
