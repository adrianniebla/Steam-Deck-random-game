import decky


class Plugin:
    # Random Game has no backend logic; everything happens in the frontend.
    async def _main(self):
        decky.logger.info("Random Game loaded")

    async def _unload(self):
        pass
