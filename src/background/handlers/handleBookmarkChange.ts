/**
 * @licence Copyright (C) 2022 - present Daniel Purtov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public Licence as published by
 * the Free Software Foundation, either version 3 of the Licence, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public Licence for more details.
 * *
 * You should have received a copy of the GNU General Public Licence
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file This is the handler for changes to bookmarks by the user.
 *
 * @author Daniel Purtov
 */

import { findFolder, handleDuplicateName } from '~/background/service/util';
import { init } from '~/background/service/init';

export const handleBookmarkChange = async (
    id: string,
    info: { title: string },
) => {
    const { customBarsId } = await chrome.storage.sync.get('customBarsId');
    const { currentBarTitle } = await chrome.storage.sync.get(
        'currentBarTitle',
    );
    if (
        !(typeof customBarsId === 'string') ||
        !(typeof currentBarTitle === 'string')
    ) {
        return;
    }

    if (id === customBarsId) {
        await init();
        return;
    }

    chrome.bookmarks.onChanged.removeListener(handleBookmarkChange);
    const title = await handleDuplicateName(id, customBarsId, info.title);
    await chrome.bookmarks.update(id, { title });
    chrome.bookmarks.onChanged.addListener(handleBookmarkChange);

    const result = await findFolder(customBarsId, currentBarTitle);
    if (result.length === 0) {
        await chrome.storage.sync.set({ currentBarTitle: title });
    }
};
