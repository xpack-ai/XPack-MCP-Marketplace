from typing import get_origin, get_args
from enum import Enum as PyEnum
from decimal import Decimal
from datetime import datetime
from sqlalchemy import DateTime, Numeric


class SqlalchemyUtils:

    @staticmethod
    def model_to_dict(model):
        result = {column.name: getattr(model, column.name) for column in model.__table__.columns}
        for key, value in list(result.items()):
            if isinstance(value, PyEnum):
                result[key] = value.value
            elif isinstance(value, Decimal):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
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

        # Map column definitions by name for type-aware restoration
        columns_by_name = {column.name: column for column in model_class.__table__.columns}

        for key, value in data_dict.items():
            column = columns_by_name.get(key)
            if not column:
                continue

            # Restore Enum from string using annotations if available
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

            # Restore Numeric and DateTime types from JSON-friendly forms
            try:
                if isinstance(column.type, Numeric) and value is not None:
                    if not isinstance(value, Decimal):
                        value = Decimal(str(value))
                elif isinstance(column.type, DateTime) and isinstance(value, str):
                    value = datetime.fromisoformat(value)
            except Exception:
                pass

            setattr(instance, key, value)

        return instance
