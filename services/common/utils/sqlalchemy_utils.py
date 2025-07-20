class SqlalchemyUtils:

    @staticmethod
    def model_to_dict(model):
        return {column.name: getattr(model, column.name) for column in model.__table__.columns}

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
                setattr(instance, key, value)

        return instance
