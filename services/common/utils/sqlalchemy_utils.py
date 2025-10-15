from typing import get_origin, get_args
from enum import Enum as PyEnum


class SqlalchemyUtils:

    @staticmethod
    def model_to_dict(model):
        result = {column.name: getattr(model, column.name) for column in model.__table__.columns}
        # Normalize Enum values to primitive for safe serialization
        for key, value in list(result.items()):
            if isinstance(value, PyEnum):
                result[key] = value.value
        return result

    @staticmethod
    def dict_to_model(model_class, data_dict):
        """
        Convert dictionary to SQLAlchemy model instance

        Args:
            model_class: SQLAlchemy model class
            data_dict: Dictionary containing model data

        Returns:
            Instance of the model class with data populated
        """
        instance = model_class()

        # Get all column names for the model
        column_names = {column.name for column in model_class.__table__.columns}

        # Set attributes that exist in both the dictionary and the model
        for key, value in data_dict.items():
            if key in column_names and hasattr(instance, key):
                # Attempt to restore Enum types from strings using type annotations
                annotations = getattr(model_class, "__annotations__", {})
                ann = annotations.get(key)
                target_type = None
                if ann is not None:
                    origin = get_origin(ann)
                    if origin is None:
                        target_type = ann
                    else:
                        args = get_args(ann)
                        if args:
                            target_type = args[0]

                if isinstance(target_type, type) and issubclass(target_type, PyEnum) and isinstance(value, str):
                    try:
                        value = target_type(value)
                    except Exception:
                        pass

                setattr(instance, key, value)

        return instance
