<?php
namespace Vanderbilt\ViderExternalModule;

use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

class ViderExternalModule extends AbstractExternalModule
{
	public function redcap_module_link_check_display($project_id, $link)
	{
		return true;
	}
}
